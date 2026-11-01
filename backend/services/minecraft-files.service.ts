import fs from "node:fs";
import path from "node:path";
import type {
  BannedIpEntry,
  BannedPlayerEntry,
  OpEntry,
  UserCacheEntry,
  WhitelistEntry,
} from "../types";

/**
 * Reads Minecraft server files for one panel installation.
 *
 * Server directories are resolved from the panel working directory (the panel runs with
 * /data as cwd, so `servers/` is /data/servers). World directories are discovered from
 * server.properties (`level-name`) and from every folder containing a level.dat, because
 * heavily modded servers usually have more than one world and the player data format
 * changed in recent versions:
 *
 *   classic: <world>/playerdata/<uuid>.dat, <world>/stats/<uuid>.json
 *   modern:  <world>/players/data/<uuid>.dat, <world>/players/stats/<uuid>.json
 */
export class MinecraftFilesService {
  constructor(private readonly rootDir: string = path.resolve("servers")) {}

  /**
   * Resolve a safe absolute path inside the server directory
   */
  getSafePath(serverId: string, subPath = ""): string {
    if (!serverId || /[\\/]|\.\./.test(serverId)) {
      throw new Error(`Invalid server id: "${serverId}"`);
    }
    const base = path.resolve(this.rootDir, serverId);
    const full = path.resolve(path.join(base, path.normalize(subPath)));

    if (full !== base && !full.startsWith(base + path.sep)) {
      throw new Error("Directory traversal attempt detected");
    }
    return full;
  }

  /**
   * Read and parse a JSON file, returning defaultValue if not found or corrupted
   */
  readJsonFile<T>(filePath: string, defaultValue: T): T {
    try {
      if (!fs.existsSync(filePath)) return defaultValue;
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as T;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Safely write a JSON file formatted with 2 spaces
   */
  writeJsonFile<T>(filePath: string, data: T): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  // --- List Files ---

  getWhitelist(serverId: string): WhitelistEntry[] {
    const p = this.getSafePath(serverId, "whitelist.json");
    return this.readJsonFile<WhitelistEntry[]>(p, []);
  }

  setWhitelist(serverId: string, list: WhitelistEntry[]): void {
    const p = this.getSafePath(serverId, "whitelist.json");
    this.writeJsonFile(p, list);
  }

  getOps(serverId: string): OpEntry[] {
    const p = this.getSafePath(serverId, "ops.json");
    return this.readJsonFile<OpEntry[]>(p, []);
  }

  setOps(serverId: string, list: OpEntry[]): void {
    const p = this.getSafePath(serverId, "ops.json");
    this.writeJsonFile(p, list);
  }

  getBannedPlayers(serverId: string): BannedPlayerEntry[] {
    const p = this.getSafePath(serverId, "banned-players.json");
    return this.readJsonFile<BannedPlayerEntry[]>(p, []);
  }

  setBannedPlayers(serverId: string, list: BannedPlayerEntry[]): void {
    const p = this.getSafePath(serverId, "banned-players.json");
    this.writeJsonFile(p, list);
  }

  getBannedIps(serverId: string): BannedIpEntry[] {
    const p = this.getSafePath(serverId, "banned-ips.json");
    return this.readJsonFile<BannedIpEntry[]>(p, []);
  }

  setBannedIps(serverId: string, list: BannedIpEntry[]): void {
    const p = this.getSafePath(serverId, "banned-ips.json");
    this.writeJsonFile(p, list);
  }

  getUserCache(serverId: string): UserCacheEntry[] {
    const p = this.getSafePath(serverId, "usercache.json");
    return this.readJsonFile<UserCacheEntry[]>(p, []);
  }

  // --- Server / world resolution ---

  /** Parse server.properties into a plain key/value map (values unescaped). */
  getServerProperties(serverId: string): Record<string, string> {
    const p = this.getSafePath(serverId, "server.properties");
    const out: Record<string, string> = {};
    let content: string;
    try {
      content = fs.readFileSync(p, "utf-8");
    } catch {
      return out;
    }

    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#") || line.startsWith("!")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      out[key] = this.unescapeProperty(line.slice(eq + 1).trim());
    }
    return out;
  }

  /** The world folder Minecraft stores the primary player data in. */
  getLevelName(serverId: string): string {
    return this.getServerProperties(serverId)["level-name"] || "world";
  }

  /**
   * All world folders of a server, most relevant first: the level-name world, then any
   * other top-level folder containing a level.dat (newest first).
   */
  getWorldDirs(serverId: string): string[] {
    const serverDir = this.getSafePath(serverId);
    const dirs: string[] = [];
    const seen = new Set<string>();

    const levelName = this.getLevelName(serverId);
    try {
      const levelDir = this.getSafePath(serverId, levelName);
      if (this.isDirectory(levelDir)) {
        dirs.push(levelDir);
        seen.add(levelDir);
      }
    } catch {
      // A malformed level-name must not break the rest of the scan
    }

    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(serverDir, { withFileTypes: true });
    } catch {
      return dirs;
    }

    const others = entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => path.join(serverDir, entry.name))
      .filter((dir) => !seen.has(dir) && this.isWorldDir(dir))
      .map((dir) => ({
        dir,
        mtime: this.mtimeMs(
          fs.existsSync(path.join(dir, "level.dat"))
            ? path.join(dir, "level.dat")
            : dir,
        ),
      }))
      .sort((a, b) => b.mtime - a.mtime)
      .map((entry) => entry.dir);

    return [...dirs, ...others];
  }

  /** A world folder has a level.dat, or at least the player data folders of a world. */
  private isWorldDir(dir: string): boolean {
    return (
      fs.existsSync(path.join(dir, "level.dat")) ||
      this.isDirectory(path.join(dir, "players", "data")) ||
      this.isDirectory(path.join(dir, "playerdata"))
    );
  }

  // --- Directory Resolution for Player Data & Stats ---

  findPlayerDataPath(serverId: string, uuid: string): string | null {
    return this.findWorldFile(serverId, uuid, [
      (u) => `players/data/${u}.dat`,
      (u) => `playerdata/${u}.dat`,
    ]);
  }

  findPlayerStatsPath(serverId: string, uuid: string): string | null {
    return this.findWorldFile(serverId, uuid, [
      (u) => `players/stats/${u}.json`,
      (u) => `stats/${u}.json`,
    ]);
  }

  findPlayerAdvancementsPath(serverId: string, uuid: string): string | null {
    return this.findWorldFile(serverId, uuid, [
      (u) => `players/advancements/${u}.json`,
      (u) => `advancements/${u}.json`,
    ]);
  }

  /**
   * Discover all player UUIDs from usercache, playerdata, and stats directories
   */
  getAllDiscoveredPlayers(
    serverId: string,
  ): Array<{ uuid: string; username?: string }> {
    const map = new Map<string, { uuid: string; username?: string }>();

    // 1. Read usercache.json
    const cache = this.getUserCache(serverId);
    for (const entry of cache) {
      if (entry.uuid) {
        map.set(entry.uuid.toLowerCase(), {
          uuid: entry.uuid.toLowerCase(),
          username: entry.name,
        });
      }
    }

    // 2. Scan every world's player data folder (classic + modern layouts)
    const dirs: string[] = [];
    for (const world of this.getWorldDirs(serverId)) {
      dirs.push(path.join(world, "players", "data"));
      dirs.push(path.join(world, "playerdata"));
    }
    try {
      dirs.push(this.getSafePath(serverId, "playerdata"));
    } catch {
      // ignore
    }

    for (const dir of dirs) {
      if (!this.isDirectory(dir)) continue;
      try {
        for (const file of fs.readdirSync(dir)) {
          if (!file.endsWith(".dat") || file.endsWith(".dat_old")) continue;
          const uuid = file.slice(0, -4).toLowerCase();
          if (!map.has(uuid)) map.set(uuid, { uuid });
        }
      } catch {
        // unreadable folder, keep scanning the others
      }
    }

    return Array.from(map.values());
  }

  /**
   * Rebuild the online set from the tail of logs/latest.log. Used when the extension is
   * activated while a server is already running, so joins that happened before activation
   * are not lost.
   */
  getOnlinePlayersFromLog(serverId: string): Set<string> {
    const online = new Set<string>();
    let logPath: string;
    try {
      logPath = this.getSafePath(serverId, "logs/latest.log");
    } catch {
      return online;
    }

    let fd: number | null = null;
    try {
      const stat = fs.statSync(logPath);
      const maxBytes = 2 * 1024 * 1024;
      const start = Math.max(0, stat.size - maxBytes);
      const length = stat.size - start;
      if (length <= 0) return online;

      const buffer = Buffer.alloc(length);
      fd = fs.openSync(logPath, "r");
      fs.readSync(fd, buffer, 0, length, start);

      let text = buffer.toString("utf-8");
      if (start > 0) {
        const firstNewline = text.indexOf("\n");
        text = firstNewline >= 0 ? text.slice(firstNewline + 1) : "";
      }
      text = text.replace(/\u001b\[[0-9;]*m/g, ""); // strip ANSI colours

      // Vanilla/Paper/Fabric log lines end the logger prefix with "]: ".
      // Requiring it avoids matching chat such as "<alice> I joined the game".
      const pattern =
        /\]:\s+([A-Za-z0-9_]{1,16})\s+(joined the game|left the game|lost connection)\b/;
      for (const line of text.split(/\r?\n/)) {
        const match = line.match(pattern);
        if (!match) continue;
        const [, name, action] = match;
        if (action === "joined the game") online.add(name);
        else online.delete(name);
      }
    } catch {
      // log missing or unreadable, nothing to seed
    } finally {
      if (fd !== null) {
        try {
          fs.closeSync(fd);
        } catch {
          // ignore
        }
      }
    }

    return online;
  }

  // --- helpers ---

  private findWorldFile(
    serverId: string,
    uuid: string,
    layouts: Array<(uuid: string) => string>,
  ): string | null {
    const cleanUuid = uuid.toLowerCase();
    const worlds = this.getWorldDirs(serverId);
    const levelWorld = worlds[0];

    // Player data is per-world on multiworld servers. The newest file is the world the
    // player last played in; the level-name world wins ties.
    const found: Array<{ file: string; mtime: number; level: boolean }> = [];
    for (const world of worlds) {
      for (const layout of layouts) {
        const candidate = path.join(world, layout(cleanUuid));
        if (this.isFile(candidate)) {
          found.push({
            file: candidate,
            mtime: this.mtimeMs(candidate),
            level: world === levelWorld,
          });
        }
      }
    }

    if (found.length > 0) {
      found.sort((a, b) => b.mtime - a.mtime || Number(b.level) - Number(a.level));
      return found[0].file;
    }

    // Legacy servers occasionally keep player data at the server root.
    for (const layout of layouts) {
      const candidate = this.getSafePath(serverId, layout(cleanUuid));
      if (this.isFile(candidate)) return candidate;
    }
    return null;
  }

  private unescapeProperty(value: string): string {
    return value.replace(/\\([:\\nrtf])/g, (_match, ch: string) => {
      switch (ch) {
        case "n":
          return "\n";
        case "r":
          return "\r";
        case "t":
          return "\t";
        case "f":
          return "\f";
        default:
          return ch;
      }
    });
  }

  private isDirectory(p: string): boolean {
    try {
      return fs.statSync(p).isDirectory();
    } catch {
      return false;
    }
  }

  private isFile(p: string): boolean {
    try {
      return fs.statSync(p).isFile();
    } catch {
      return false;
    }
  }

  private mtimeMs(p: string): number {
    try {
      return fs.statSync(p).mtimeMs;
    } catch {
      return 0;
    }
  }
}
