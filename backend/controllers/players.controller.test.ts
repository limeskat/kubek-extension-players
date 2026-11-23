import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { MinecraftFilesService } from "../services/minecraft-files.service";
import { NbtParserService, type NbtNode } from "../services/nbt-parser.service";
import { OnlineTracker } from "../services/online-tracker.service";
import { SkinAvatarService } from "../services/skin-avatar.service";
import { StatsParserService } from "../services/stats-parser.service";
import { createPlayersRoutes } from "./players.controller";

const UUID = "11111111-1111-4111-8111-111111111111";
const USERNAME = "Alex";
const UUID2 = "22222222-2222-4222-8222-222222222222";

let root: string;
let serverDir: string;
let files: MinecraftFilesService;
let nbt: NbtParserService;
let executor: any;
let onlinePlayers: Set<string>;
let tracker: any;
let teleportCalls: any[];

function nbtRoot(): NbtNode {
  return {
    type: 10,
    value: {
      Pos: {
        type: 9,
        value: {
          itemType: 6,
          items: [0, 64, 0].map((value) => ({ type: 6, value })),
        },
      },
      Motion: {
        type: 9,
        value: {
          itemType: 6,
          items: [0, 0, 0].map((value) => ({ type: 6, value })),
        },
      },
      Dimension: { type: 8, value: "minecraft:overworld" },
      Health: { type: 5, value: 20 },
      Inventory: { type: 9, value: { itemType: 10, items: [] } },
    },
  };
}

function route() {
  const routes = createPlayersRoutes(
    files,
    nbt,
    new StatsParserService(),
    executor,
    new SkinAvatarService(() => "mc-heads"),
    tracker,
  );
  return routes.find((r) => r.path === "/servers/:serverId/players/:uuid/teleport")!;
}

async function callTeleport(body: any, uuid = UUID): Promise<{ status: number; body: any }> {
  let status = 200;
  let payload: any;
  const res: any = {
    json: (data: any) => {
      payload = data;
    },
    status: (code: number) => {
      status = code;
      return res;
    },
    send: () => {},
  };
  await route().handler(
    {
      params: { serverId: "srv", uuid },
      body,
      query: {},
      user: { id: "u", username: "admin", isAdmin: true, permissions: [] },
    } as any,
    res,
  );
  return { status, body: payload };
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "kubek-controller-"));
  serverDir = path.join(root, "srv");
  fs.mkdirSync(path.join(serverDir, "world_2", "players", "data"), { recursive: true });
  fs.writeFileSync(path.join(serverDir, "server.properties"), "level-name=world_2\n");
  fs.writeFileSync(
    path.join(serverDir, "usercache.json"),
    JSON.stringify([{ uuid: UUID, name: USERNAME }]),
  );

  files = new MinecraftFilesService(root);
  nbt = new NbtParserService();
  nbt.writePlayerDataFile(
    path.join(serverDir, "world_2", "players", "data", `${UUID}.dat`),
    nbtRoot(),
  );

  teleportCalls = [];
  executor = {
    isServerRunning: () => true,
    teleportPlayer: async (...args: any[]) => {
      teleportCalls.push(args);
      return true;
    },
  };
  onlinePlayers = new Set<string>();
  tracker = {
    get: () => onlinePlayers,
    sync: () => onlinePlayers,
    add: (_serverId: string, name: string) => onlinePlayers.add(name),
    remove: (_serverId: string, name: string) => onlinePlayers.delete(name),
    clear: () => onlinePlayers.clear(),
    clearAll: () => onlinePlayers.clear(),
  };
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("POST /teleport", () => {
  test("uses the console command for an online player", async () => {
    onlinePlayers = new Set([USERNAME]);
    const result = await callTeleport({ world: "minecraft:the_nether", x: 1, y: 70, z: 2 });
    expect(result.status).toBe(200);
    expect(result.body.method).toBe("command");
    expect(teleportCalls).toHaveLength(1);
    expect(teleportCalls[0][2]).toEqual({ world: "minecraft:the_nether", x: 1, y: 70, z: 2 });
  });

  test("writes the player data file for an offline player", async () => {
    const result = await callTeleport({ world: "minecraft:the_nether", x: 10, y: 70, z: -5 });
    expect(result.status).toBe(200);
    expect(result.body.method).toBe("player-data");
    expect(teleportCalls).toHaveLength(0);

    const parsed = nbt.parsePlayerDataFile(files.findPlayerDataPath("srv", UUID)!)!;
    expect(parsed.Pos).toEqual([10, 70, -5]);
    expect(parsed.Dimension).toBe("minecraft:the_nether");
  });

  test("rejects invalid coordinates", async () => {
    const result = await callTeleport({ world: "minecraft:overworld", x: "nope", y: 1, z: 2 });
    expect(result.status).toBe(400);
  });

  test("returns 404 when an offline player has no data file", async () => {
    const result = await callTeleport(
      { world: "minecraft:overworld", x: 1, y: 2, z: 3 },
      "00000000-0000-0000-0000-000000000000",
    );
    expect(result.status).toBe(404);
  });
});

describe("DELETE /servers/:serverId/players/:uuid", () => {
  function deleteHandler() {
    const routes = createPlayersRoutes(
      files,
      nbt,
      new StatsParserService(),
      executor,
      new SkinAvatarService(() => "mc-heads"),
      tracker,
    );
    return routes.find(
      (r) => r.method === "DELETE" && r.path === "/servers/:serverId/players/:uuid",
    )!;
  }

  async function callDelete(uuid = UUID): Promise<{ status: number; body: any }> {
    let status = 200;
    let payload: any;
    const res: any = {
      json: (data: any) => {
        payload = data;
      },
      status: (code: number) => {
        status = code;
        return res;
      },
    };
    await deleteHandler().handler(
      {
        params: { serverId: "srv", uuid },
        body: {},
        query: {},
        user: { id: "u", username: "admin", isAdmin: true, permissions: [] },
      } as any,
      res,
    );
    return { status, body: payload };
  }

  function seedFiles() {
    const dat = path.join(serverDir, "world_2", "players", "data", `${UUID}.dat`);
    const stats = path.join(serverDir, "world_2", "players", "stats", `${UUID}.json`);
    const adv = path.join(serverDir, "world_2", "players", "advancements", `${UUID}.json`);
    for (const file of [dat, stats, adv]) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, "x");
    }
    fs.writeFileSync(`${dat}_old`, "old");

    const otherDat = path.join(serverDir, "world_other", "players", "data", `${UUID}.dat`);
    fs.mkdirSync(path.dirname(otherDat), { recursive: true });
    fs.writeFileSync(otherDat, "x");
    fs.writeFileSync(path.join(serverDir, "world_other", "level.dat"), "");

    return { dat, stats, adv, otherDat };
  }

  test("removes data, backup, stats, advancements and the usercache entry", async () => {
    const { dat, stats, adv, otherDat } = seedFiles();

    const result = await callDelete();

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(result.body.removedFromCache).toBe(1);
    expect(fs.existsSync(dat)).toBe(false);
    expect(fs.existsSync(`${dat}_old`)).toBe(false);
    expect(fs.existsSync(stats)).toBe(false);
    expect(fs.existsSync(adv)).toBe(false);
    expect(fs.existsSync(otherDat)).toBe(false);
    expect(files.getUserCache("srv")).toEqual([]);
  });

  test("refuses while the player is online and keeps every file", async () => {
    const { dat } = seedFiles();
    onlinePlayers = new Set([USERNAME]);

    const result = await callDelete();

    expect(result.status).toBe(409);
    expect(fs.existsSync(dat)).toBe(true);
    expect(files.getUserCache("srv")).toHaveLength(1);
  });

  test("keeps a cache entry that shares the name but has another uuid", async () => {
    fs.writeFileSync(
      path.join(serverDir, "usercache.json"),
      JSON.stringify([
        { uuid: UUID, name: USERNAME },
        { uuid: UUID2, name: USERNAME },
      ]),
    );

    const result = await callDelete();

    expect(result.status).toBe(200);
    expect(result.body.removedFromCache).toBe(1);
    expect(files.getUserCache("srv").map((entry) => entry.uuid)).toEqual([UUID2]);
  });

  test("returns 404 when the player has no files and no cache entry", async () => {
    // beforeEach seeds a data file for the teleport tests
    fs.rmSync(files.findPlayerDataPath("srv", UUID)!, { force: true });
    fs.writeFileSync(path.join(serverDir, "usercache.json"), "[]");

    const result = await callDelete();

    expect(result.status).toBe(404);
  });
});

describe("GET /online", () => {
  test("catches up from the server log before answering", async () => {
    fs.mkdirSync(path.join(serverDir, "logs"), { recursive: true });
    const log = path.join(serverDir, "logs", "latest.log");
    fs.writeFileSync(
      log,
      [
        "[06:00:09] [Server thread/INFO]: deiwos[/10.0.0.1:41918] logged in with entity id 1",
        "[06:00:09] [Server thread/INFO]: System chat: deiwos joined the game",
      ].join("\n") + "\n",
    );

    const realTracker = new OnlineTracker(files);
    const routes = createPlayersRoutes(
      files,
      nbt,
      new StatsParserService(),
      executor,
      new SkinAvatarService(() => "mc-heads"),
      realTracker,
    );
    const handler = routes.find(
      (r) => r.method === "GET" && r.path === "/servers/:serverId/online",
    )!;

    const call = async () => {
      let payload: any;
      await handler.handler(
        { params: { serverId: "srv" }, body: {}, query: {}, user: {} } as any,
        {
          json: (data: any) => {
            payload = data;
          },
          status: () => ({ json: () => {} }),
          send: () => {},
        } as any,
      );
      return payload;
    };

    expect((await call()).online.map((player: any) => player.username)).toEqual(["deiwos"]);

    fs.appendFileSync(log, "[06:00:49] [Server thread/INFO]: deiwos lost connection: Disconnected\n");
    expect((await call()).online).toEqual([]);
  });
});
