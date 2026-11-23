import fs from "node:fs";
import type { MinecraftFilesService } from "./minecraft-files.service";
import { parsePlayerLogLine } from "./player-log";

const TAIL_BYTES = 2 * 1024 * 1024;
const MAX_CATCH_UP_BYTES = 4 * 1024 * 1024;
const ANCHOR_BYTES = 256;

interface LogState {
  initialized: boolean;
  /** Byte offset of the next unread line in logs/latest.log. */
  offset: number;
  /** Inode at the last read, so a rotated log reseeds. */
  ino: number;
  /** Last bytes before the offset, so a rewritten log reseeds even at the same size. */
  anchor: string;
  players: Set<string>;
}

/**
 * Online players per server, kept in sync with the tail of logs/latest.log.
 *
 * The panel does not emit player.joined/player.left on every core, so the log is the source of
 * truth. Reads are incremental: the first sync takes the last 2 MB, later syncs only the bytes
 * written since. A partial trailing line is left for the next read.
 */
export class OnlineTracker {
  private readonly states = new Map<string, LogState>();

  constructor(private readonly files: MinecraftFilesService) {}

  /** Current set without touching the disk. */
  get(serverId: string): Set<string> {
    return this.state(serverId).players;
  }

  /** Catch up from the log tail and return the set. */
  sync(serverId: string): Set<string> {
    const state = this.state(serverId);
    const path = this.logPath(serverId);
    if (!path) return state.players;

    let stat: fs.Stats;
    try {
      stat = fs.statSync(path);
    } catch {
      return state.players;
    }

    const reseed =
      !state.initialized ||
      state.ino !== stat.ino ||
      stat.size < state.offset ||
      // A restart can rewrite latest.log with the same size or a longer one; the bytes
      // before our offset are then different even though size alone cannot tell.
      !this.anchorMatches(path, state.offset, state.anchor) ||
      stat.size - state.offset > MAX_CATCH_UP_BYTES;

    if (reseed) {
      state.players = new Set();
      state.ino = stat.ino;
      state.initialized = true;
      state.offset = Math.max(0, stat.size - TAIL_BYTES);
      state.offset = this.consume(
        state,
        path,
        state.offset,
        stat.size,
        this.startsMidLine(path, state.offset),
      );
      state.anchor = this.readAnchor(path, state.offset);
      return state.players;
    }

    if (stat.size > state.offset) {
      state.offset = this.consume(state, path, state.offset, stat.size, false);
      state.anchor = this.readAnchor(path, state.offset);
    }
    return state.players;
  }

  /** Apply a line delivered by the panel's server.log event. */
  handleLine(serverId: string, line: string): void {
    const event = parsePlayerLogLine(line);
    if (!event) return;
    if (event.action === "join") this.add(serverId, event.name);
    else this.remove(serverId, event.name);
  }

  add(serverId: string, name: string): void {
    if (name) this.state(serverId).players.add(name);
  }

  remove(serverId: string, name: string): void {
    if (!name) return;
    this.removeFrom(this.state(serverId).players, name);
  }

  /** Drop the cached set and offset; the next sync seeds from the log tail. */
  clear(serverId: string): void {
    this.states.delete(serverId);
  }

  clearAll(): void {
    this.states.clear();
  }

  private state(serverId: string): LogState {
    let state = this.states.get(serverId);
    if (!state) {
      state = { initialized: false, offset: 0, ino: -1, anchor: "", players: new Set() };
      this.states.set(serverId, state);
    }
    return state;
  }

  private logPath(serverId: string): string | null {
    try {
      return this.files.getSafePath(serverId, "logs/latest.log");
    } catch {
      return null;
    }
  }

  /** True when offset falls inside a line, so the first tail line is a fragment. */
  private startsMidLine(path: string, offset: number): boolean {
    if (offset <= 0) return false;
    let fd: number | null = null;
    try {
      const buffer = Buffer.alloc(1);
      fd = fs.openSync(path, "r");
      fs.readSync(fd, buffer, 0, 1, offset - 1);
      return buffer[0] !== 0x0a;
    } catch {
      return false;
    } finally {
      if (fd !== null) {
        try {
          fs.closeSync(fd);
        } catch {
          // ignore
        }
      }
    }
  }

  /** Last ANCHOR_BYTES before the offset, or "" when there is nothing to compare yet. */
  private readAnchor(path: string, offset: number): string {
    if (offset <= 0) return "";
    const length = Math.min(ANCHOR_BYTES, offset);
    let fd: number | null = null;
    try {
      const buffer = Buffer.alloc(length);
      fd = fs.openSync(path, "r");
      fs.readSync(fd, buffer, 0, length, offset - length);
      return buffer.toString("utf-8");
    } catch {
      return "";
    } finally {
      if (fd !== null) {
        try {
          fs.closeSync(fd);
        } catch {
          // ignore
        }
      }
    }
  }

  private anchorMatches(path: string, offset: number, anchor: string): boolean {
    if (offset <= 0 || !anchor) return true;
    return this.readAnchor(path, offset) === anchor;
  }

  /**
   * Read [start, end), apply every complete line and return the offset just past the last
   * complete line. The tail can be re-read if the file ends mid-line.
   */
  private consume(
    state: LogState,
    path: string,
    start: number,
    end: number,
    skipFirstPartial: boolean,
  ): number {
    if (end <= start) return start;

    let fd: number | null = null;
    try {
      const length = end - start;
      const buffer = Buffer.alloc(length);
      fd = fs.openSync(path, "r");
      fs.readSync(fd, buffer, 0, length, start);

      let text = buffer.toString("utf-8");
      let base = start;

      if (skipFirstPartial) {
        const firstNewline = text.indexOf("\n");
        if (firstNewline < 0) return start;
        base += Buffer.byteLength(text.slice(0, firstNewline + 1));
        text = text.slice(firstNewline + 1);
      }

      const lastNewline = text.lastIndexOf("\n");
      if (lastNewline < 0) return base;

      const complete = text.slice(0, lastNewline);
      for (const line of complete.split("\n")) {
        const event = parsePlayerLogLine(line);
        if (!event) continue;
        if (event.action === "join") state.players.add(event.name);
        else this.removeFrom(state.players, event.name);
      }

      return base + Buffer.byteLength(text.slice(0, lastNewline + 1));
    } catch {
      return start;
    } finally {
      if (fd !== null) {
        try {
          fs.closeSync(fd);
        } catch {
          // ignore
        }
      }
    }
  }

  private removeFrom(players: Set<string>, name: string): void {
    for (const candidate of players) {
      if (candidate.toLowerCase() === name.toLowerCase()) {
        players.delete(candidate);
        return;
      }
    }
  }
}
