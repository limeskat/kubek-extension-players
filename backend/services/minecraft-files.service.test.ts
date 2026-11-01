import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { MinecraftFilesService } from "./minecraft-files.service";

const UUID = "2f58b851-dfbe-32e5-8047-eefa5a83e07a";
const UUID2 = "2dc734f0-9def-3f60-a162-490dcf2b115d";

let root: string;
let serverDir: string;
let files: MinecraftFilesService;

function write(rel: string, content = "") {
  const full = path.join(serverDir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  return rel;
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "kubek-files-"));
  serverDir = path.join(root, "server-1");
  fs.mkdirSync(serverDir, { recursive: true });
  files = new MinecraftFilesService(root);
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("MinecraftFilesService world resolution", () => {
  test("reads level-name from server.properties", () => {
    write("server.properties", "motd=hi\nlevel-name=world_2\n");
    expect(files.getLevelName("server-1")).toBe("world_2");
  });

  test("unescapes property values", () => {
    write("server.properties", "level-name=my\\:world\n");
    expect(files.getLevelName("server-1")).toBe("my:world");
  });

  test("finds player data in the new players/data layout of the level world", () => {
    write("server.properties", "level-name=world_2\n");
    write(`world_2/players/data/${UUID}.dat`, "dat");
    expect(files.findPlayerDataPath("server-1", UUID)).toBe(
      path.join(serverDir, "world_2/players/data", `${UUID}.dat`),
    );
  });

  test("finds classic playerdata layout", () => {
    write("server.properties", "level-name=survival\n");
    write(`survival/playerdata/${UUID}.dat`, "dat");
    expect(files.findPlayerDataPath("server-1", UUID)).toBe(
      path.join(serverDir, "survival/playerdata", `${UUID}.dat`),
    );
  });

  test("prefers the newest player data across multiworld folders", () => {
    write("server.properties", "level-name=world_2\n");
    const levelFile = write(`world_2/players/data/${UUID}.dat`, "level");
    const otherFile = write(`other/players/data/${UUID}.dat`, "other");
    const now = Date.now() / 1000;
    fs.utimesSync(path.join(serverDir, levelFile), now - 600, now - 600);
    fs.utimesSync(path.join(serverDir, otherFile), now, now);
    expect(files.findPlayerDataPath("server-1", UUID)).toBe(
      path.join(serverDir, "other/players/data", `${UUID}.dat`),
    );
  });

  test("prefers the level world when player data has the same mtime", () => {
    write("server.properties", "level-name=world_2\n");
    const levelFile = write(`world_2/players/data/${UUID}.dat`, "level");
    const otherFile = write(`other/players/data/${UUID}.dat`, "other");
    const now = Date.now() / 1000;
    fs.utimesSync(path.join(serverDir, levelFile), now, now);
    fs.utimesSync(path.join(serverDir, otherFile), now, now);
    expect(files.findPlayerDataPath("server-1", UUID)).toBe(
      path.join(serverDir, "world_2/players/data", `${UUID}.dat`),
    );
  });

  test("falls back to another world when the level world has no data for the player", () => {
    write("server.properties", "level-name=world_2\n");
    write(`world_2/players/data/${UUID2}.dat`, "someone-else");
    write(`other/players/data/${UUID}.dat`, "other");
    expect(files.findPlayerDataPath("server-1", UUID)).toBe(
      path.join(serverDir, "other/players/data", `${UUID}.dat`),
    );
  });

  test("finds stats and advancements in the new layout", () => {
    write("server.properties", "level-name=world_2\n");
    write(`world_2/players/stats/${UUID}.json`, "{}");
    write(`world_2/players/advancements/${UUID}.json`, "{}");
    expect(files.findPlayerStatsPath("server-1", UUID)).toBe(
      path.join(serverDir, "world_2/players/stats", `${UUID}.json`),
    );
    expect(files.findPlayerAdvancementsPath("server-1", UUID)).toBe(
      path.join(serverDir, "world_2/players/advancements", `${UUID}.json`),
    );
  });

  test("returns null for missing player data", () => {
    write("server.properties", "level-name=world_2\n");
    expect(files.findPlayerDataPath("server-1", UUID)).toBeNull();
    expect(files.findPlayerStatsPath("server-1", UUID)).toBeNull();
  });

  test("discovers players from every world, not just the level world", () => {
    write("server.properties", "level-name=world_2\n");
    write(
      "usercache.json",
      JSON.stringify([{ uuid: UUID, name: "pibaspam", expiresOn: "later" }]),
    );
    write(`world_2/players/data/${UUID}.dat`, "dat");
    write(`other/players/data/${UUID2}.dat`, "dat");
    const found = files.getAllDiscoveredPlayers("server-1");
    expect(found.map((p) => p.uuid).sort()).toEqual([UUID, UUID2].sort());
    expect(found.find((p) => p.uuid === UUID)?.username).toBe("pibaspam");
  });

  test("discovers players from the legacy server-root playerdata folder", () => {
    write("server.properties", "level-name=world\n");
    write(`playerdata/${UUID}.dat`, "dat");
    expect(files.getAllDiscoveredPlayers("server-1")).toEqual([{ uuid: UUID }]);
  });
});

describe("MinecraftFilesService online players from log", () => {
  test("replays join and leave lines", () => {
    write(
      "logs/latest.log",
      [
        "[12:00:00] [Server thread/INFO]: pibaspam joined the game",
        "[12:01:00] [Server thread/INFO]: RONIIINNN joined the game",
        "[12:02:00] [Server thread/INFO]: pibaspam left the game",
        "[12:03:00] [Server thread/INFO]: \u001b[32mdeiwos joined the game\u001b[0m",
        "[12:04:00] [Server thread/INFO]: RONIIINNN lost connection: Disconnected",
      ].join("\n"),
    );
    expect([...files.getOnlinePlayersFromLog("server-1")]).toEqual(["deiwos"]);
  });

  test("ignores chat messages that mention joining", () => {
    write(
      "logs/latest.log",
      "[12:00:00] [Server thread/INFO]: <pibaspam> I joined the game yesterday\n",
    );
    expect([...files.getOnlinePlayersFromLog("server-1")]).toEqual([]);
  });
});

describe("MinecraftFilesService removeUserCacheEntry", () => {
  const cache = [
    { uuid: UUID, name: "alice", expiresOn: "2026-01-01" },
    { uuid: UUID2, name: "bob" },
  ];

  test("removes the entry by uuid and keeps the others", () => {
    write("usercache.json", JSON.stringify(cache));
    expect(files.removeUserCacheEntry("server-1", UUID)).toBe(1);
    expect(files.getUserCache("server-1")).toEqual([{ uuid: UUID2, name: "bob" }]);
  });

  test("keeps an entry that shares the name but has another uuid", () => {
    write("usercache.json", JSON.stringify(cache));
    expect(files.removeUserCacheEntry("server-1", "00000000-0000-0000-0000-000000000000")).toBe(0);
    expect(files.getUserCache("server-1").map((entry) => entry.name)).toEqual(["alice", "bob"]);
  });

  test("leaves the file untouched when nothing matches", () => {
    write("usercache.json", JSON.stringify(cache));
    expect(files.removeUserCacheEntry("server-1", "missing-uuid")).toBe(0);
    expect(files.getUserCache("server-1")).toHaveLength(2);
  });

  test("tolerates a missing or malformed cache", () => {
    expect(files.removeUserCacheEntry("server-1", UUID)).toBe(0);
    write("usercache.json", "{not json");
    expect(files.removeUserCacheEntry("server-1", UUID)).toBe(0);
  });
});

describe("MinecraftFilesService findAllPlayerFiles", () => {
  test("collects every layout in every world, including .dat_old", () => {
    write("world_2/level.dat");
    write(`world_2/players/data/${UUID}.dat`);
    write(`world_2/players/data/${UUID}.dat_old`);
    write(`world_2/players/stats/${UUID}.json`);
    write(`world_2/players/advancements/${UUID}.json`);

    write("world_old/level.dat");
    write(`world_old/playerdata/${UUID}.dat`);
    write(`world_old/stats/${UUID}.json`);

    const found = files
      .findAllPlayerFiles("server-1", UUID)
      .map((file) => path.relative(serverDir, file).replace(/\\/g, "/"))
      .sort();

    expect(found).toEqual(
      [
        `world_old/playerdata/${UUID}.dat`,
        `world_old/stats/${UUID}.json`,
        `world_2/players/advancements/${UUID}.json`,
        `world_2/players/data/${UUID}.dat`,
        `world_2/players/data/${UUID}.dat_old`,
        `world_2/players/stats/${UUID}.json`,
      ].sort(),
    );
  });

  test("returns an empty list for an unknown player", () => {
    write("world_2/level.dat");
    expect(files.findAllPlayerFiles("server-1", "00000000-0000-0000-0000-000000000000")).toEqual([]);
  });
});
