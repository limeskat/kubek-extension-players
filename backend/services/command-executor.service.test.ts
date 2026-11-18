import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { CommandExecutorService, clearMojangCache } from "./command-executor.service";
import { MinecraftFilesService } from "./minecraft-files.service";

let root: string;
let serverDir: string;
let files: MinecraftFilesService;
let executor: CommandExecutorService;
let originalFetch: typeof globalThis.fetch;

const LOWER_UUID = "3d6731a6-630b-3ebb-a51a-0f4c44c4a878";
const CANONICAL_UUID = "55555555-5555-4555-8555-555555555555";

function ctx() {
  return {
    servers: {
      get: () => ({ status: "stopped" }),
      sendCommand: async () => true,
    },
  } as any;
}

function whitelist(): Array<{ uuid: string; name: string }> {
  return JSON.parse(fs.readFileSync(path.join(serverDir, "whitelist.json"), "utf8"));
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "kubek-exec-"));
  serverDir = path.join(root, "srv");
  fs.mkdirSync(serverDir, { recursive: true });
  fs.writeFileSync(path.join(serverDir, "server.properties"), "online-mode=false\n");
  fs.writeFileSync(path.join(serverDir, "usercache.json"), "[]");
  fs.writeFileSync(path.join(serverDir, "whitelist.json"), "[]");
  files = new MinecraftFilesService(root);
  executor = new CommandExecutorService(ctx(), files);
  clearMojangCache();
  originalFetch = globalThis.fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  fs.rmSync(root, { recursive: true, force: true });
});

describe("addToWhitelist on an offline-mode server", () => {
  test("derives the offline uuid when Mojang has no profile", async () => {
    globalThis.fetch = (async () => new Response("{}", { status: 404 })) as any;

    expect(await executor.addToWhitelist("srv", "ari")).toBe(true);

    const list = whitelist();
    expect(list).toHaveLength(1);
    expect(list[0].uuid).toBe(LOWER_UUID);
    expect(list[0].name).toBe("ari");
  });

  test("ignores Mojang spelling on an offline server and keeps the typed name", async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({ id: "88888888888848888888888888888888", name: "Ari" }),
        { status: 200, headers: { "content-type": "application/json" } },
      )) as any;

    expect(await executor.addToWhitelist("srv", "ari")).toBe(true);

    const list = whitelist();
    expect(list[0].uuid).toBe(LOWER_UUID);
    expect(list[0].name).toBe("ari");
  });

  test("prefers the usercache spelling when the name already joined", async () => {
    fs.writeFileSync(
      path.join(serverDir, "usercache.json"),
      JSON.stringify([{ uuid: CANONICAL_UUID, name: "Ari" }]),
    );
    globalThis.fetch = (async () => {
      throw new Error("Mojang must not be called for a cached name");
    }) as any;

    expect(await executor.addToWhitelist("srv", "ari")).toBe(true);

    const list = whitelist();
    expect(list[0].uuid).toBe(CANONICAL_UUID);
    expect(list[0].name).toBe("Ari");
  });

  test("online-mode servers use the Mojang profile and its uuid", async () => {
    fs.writeFileSync(path.join(serverDir, "server.properties"), "online-mode=true\n");
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({ id: "77777777777747778777777777777777", name: "Notch" }),
        { status: 200, headers: { "content-type": "application/json" } },
      )) as any;

    expect(await executor.addToWhitelist("srv", "notch")).toBe(true);
    expect(whitelist()[0]).toEqual({
      uuid: "77777777-7777-4777-8777-777777777777",
      name: "Notch",
    });
  });

  test("refuses on an online-mode server when Mojang has no profile", async () => {
    fs.writeFileSync(path.join(serverDir, "server.properties"), "online-mode=true\n");
    globalThis.fetch = (async () => new Response("{}", { status: 404 })) as any;

    expect(await executor.addToWhitelist("srv", "ari")).toBe(false);
    expect(whitelist()).toHaveLength(0);
  });
});
