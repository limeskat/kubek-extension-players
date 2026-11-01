import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { MinecraftFilesService } from "../services/minecraft-files.service";
import { NbtParserService, type NbtNode } from "../services/nbt-parser.service";
import { SkinAvatarService } from "../services/skin-avatar.service";
import { StatsParserService } from "../services/stats-parser.service";
import { createPlayersRoutes } from "./players.controller";

const UUID = "2f58b851-dfbe-32e5-8047-eefa5a83e07a";
const USERNAME = "pibaspam";

let root: string;
let serverDir: string;
let files: MinecraftFilesService;
let nbt: NbtParserService;
let executor: any;
let tracker: Map<string, Set<string>>;
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
  tracker = new Map();
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("POST /teleport", () => {
  test("uses the console command for an online player", async () => {
    tracker.set("srv", new Set([USERNAME]));
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
