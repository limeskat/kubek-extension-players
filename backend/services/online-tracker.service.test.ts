import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { MinecraftFilesService } from "./minecraft-files.service";
import { OnlineTracker } from "./online-tracker.service";

let root: string;
let serverDir: string;
let files: MinecraftFilesService;
let tracker: OnlineTracker;

const logPath = () => path.join(serverDir, "logs", "latest.log");

function writeLog(lines: string[], append = false) {
  fs.mkdirSync(path.dirname(logPath()), { recursive: true });
  fs.writeFileSync(logPath(), lines.join("\n") + "\n", { flag: append ? "a" : "w" });
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "kubek-online-"));
  serverDir = path.join(root, "server-1");
  fs.mkdirSync(serverDir, { recursive: true });
  files = new MinecraftFilesService(root);
  tracker = new OnlineTracker(files);
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("OnlineTracker log tail", () => {
  test("seeds from the current log and follows appended lines", () => {
    writeLog([
      "[06:00:09] [Server thread/INFO]: System chat: deiwos joined the game",
      "[06:00:09] [Server thread/INFO]: deiwos[/10.0.0.1:41918] logged in with entity id 1",
    ]);
    expect([...tracker.sync("server-1")]).toEqual(["deiwos"]);

    writeLog(["[06:05:00] [Server thread/INFO]: System chat: Alex joined the game"], true);
    expect([...tracker.sync("server-1")].sort()).toEqual(["Alex", "deiwos"]);

    writeLog(["[06:06:00] [Server thread/INFO]: deiwos lost connection: Disconnected"], true);
    expect([...tracker.sync("server-1")]).toEqual(["Alex"]);
  });

  test("resets when the log is truncated on restart", () => {
    writeLog(["[06:00:00] [Server thread/INFO]: Alex joined the game"]);
    expect([...tracker.sync("server-1")]).toEqual(["Alex"]);

    writeLog(["[07:00:00] [Server thread/INFO]: Steve joined the game"]);
    expect([...tracker.sync("server-1")]).toEqual(["Steve"]);
  });

  test("applies live log lines without waiting for a sync", () => {
    writeLog([]);
    tracker.sync("server-1");
    tracker.handleLine("server-1", "[12:00:00] [Server thread/INFO]: Steve joined the game");
    expect([...tracker.get("server-1")]).toEqual(["Steve"]);
    tracker.handleLine(
      "server-1",
      "[12:01:00] [Server thread/INFO]: System chat: Steve left the game",
    );
    expect([...tracker.get("server-1")]).toEqual([]);
  });

  test("matches panel events case-insensitively on leave", () => {
    tracker.add("server-1", "Steve");
    tracker.remove("server-1", "steve");
    expect([...tracker.get("server-1")]).toEqual([]);
  });

  test("clear empties the set and the next sync reseeds", () => {
    writeLog(["[06:00:00] [Server thread/INFO]: Alex joined the game"]);
    tracker.sync("server-1");
    tracker.clear("server-1");
    expect([...tracker.get("server-1")]).toEqual([]);
    expect([...tracker.sync("server-1")]).toEqual(["Alex"]);
  });

  test("returns an empty set when the log does not exist", () => {
    expect([...tracker.sync("server-1")]).toEqual([]);
  });
});
