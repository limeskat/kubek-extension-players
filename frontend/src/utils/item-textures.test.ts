import { expect, test } from "bun:test";
import {
  ASSET_CDN,
  FALLBACK_VERSION,
  pickTexture,
  resolveItemTexture,
  textureUrl,
} from "./item-textures";

const VERSION = "26.2";

function jsonFetcher(map: Record<string, unknown>) {
  const calls: string[] = [];
  const fetchJson = async (url: string) => {
    calls.push(url);
    const key = Object.keys(map).find((fragment) => url.includes(fragment));
    return key ? map[key] : null;
  };
  return { fetchJson, calls };
}

test("textureUrl builds a versioned CDN url and strips the namespace", () => {
  expect(textureUrl("minecraft:item/arrow", VERSION)).toBe(
    `${ASSET_CDN}@${VERSION}/assets/minecraft/textures/item/arrow.png`,
  );
  expect(textureUrl("block/oak_sapling", VERSION)).toBe(
    `${ASSET_CDN}@${VERSION}/assets/minecraft/textures/block/oak_sapling.png`,
  );
});

test("pickTexture prefers layer0, then a generic slot", () => {
  expect(pickTexture({ layer0: "minecraft:item/arrow", all: "x" })).toBe("minecraft:item/arrow");
  expect(pickTexture({ all: "minecraft:block/cobblestone" })).toBe("minecraft:block/cobblestone");
  expect(pickTexture({ side: "minecraft:block/oak_log" })).toBe("minecraft:block/oak_log");
  expect(pickTexture({ particle: "minecraft:block/dark_oak_planks" })).toBeNull();
  expect(pickTexture({})).toBeNull();
  expect(pickTexture(undefined)).toBeNull();
});

test("resolves an item through its item definition and model", async () => {
  const { fetchJson } = jsonFetcher({
    "items/arrow.json": { model: { type: "minecraft:model", model: "minecraft:item/arrow" } },
    "models/item/arrow.json": { parent: "minecraft:item/generated", textures: { layer0: "minecraft:item/arrow" } },
  });

  await expect(resolveItemTexture("minecraft:arrow", VERSION, { fetchJson, cache: new Map() })).resolves.toBe(
    `${ASSET_CDN}@${VERSION}/assets/minecraft/textures/item/arrow.png`,
  );
});

test("follows a model that points into the block textures", async () => {
  const { fetchJson } = jsonFetcher({
    "items/oak_sapling.json": { model: { model: "minecraft:item/oak_sapling" } },
    "models/item/oak_sapling.json": { textures: { layer0: "minecraft:block/oak_sapling" } },
  });

  await expect(resolveItemTexture("minecraft:oak_sapling", VERSION, { fetchJson, cache: new Map() })).resolves.toBe(
    `${ASSET_CDN}@${VERSION}/assets/minecraft/textures/block/oak_sapling.png`,
  );
});

test("walks parent models until a texture is found", async () => {
  const { fetchJson } = jsonFetcher({
    "items/thing.json": { model: { model: "minecraft:item/thing" } },
    "models/item/thing.json": { parent: "minecraft:item/template" },
    "models/item/template.json": { textures: { layer0: "minecraft:item/thing_base" } },
  });

  await expect(resolveItemTexture("minecraft:thing", VERSION, { fetchJson, cache: new Map() })).resolves.toBe(
    `${ASSET_CDN}@${VERSION}/assets/minecraft/textures/item/thing_base.png`,
  );
});

test("falls back to models/item for versions without item definitions", async () => {
  const { fetchJson, calls } = jsonFetcher({
    "models/item/legacy.json": { textures: { layer0: "minecraft:item/legacy" } },
  });

  await expect(resolveItemTexture("minecraft:legacy", VERSION, { fetchJson, cache: new Map() })).resolves.toBe(
    `${ASSET_CDN}@${VERSION}/assets/minecraft/textures/item/legacy.png`,
  );
  expect(calls.some((url) => url.includes("items/legacy.json"))).toBe(true);
});

test("modded namespaces resolve to null without touching the CDN", async () => {
  const { fetchJson, calls } = jsonFetcher({});
  await expect(resolveItemTexture("create:brass_ingot", VERSION, { fetchJson, cache: new Map() })).resolves.toBeNull();
  expect(calls).toHaveLength(0);
});

test("caches a resolved texture per version and item", async () => {
  const { fetchJson, calls } = jsonFetcher({
    "items/arrow.json": { model: { model: "minecraft:item/arrow" } },
    "models/item/arrow.json": { textures: { layer0: "minecraft:item/arrow" } },
  });

  await resolveItemTexture("minecraft:arrow", VERSION, { fetchJson, cache: new Map() });
  const cache = new Map<string, string | null>();
  await resolveItemTexture("minecraft:arrow", VERSION, { fetchJson, cache });
  const secondPass = calls.length;
  await resolveItemTexture("minecraft:arrow", VERSION, { fetchJson, cache });
  expect(calls.length).toBe(secondPass);
});

test("a different version is not served from another version's cache", async () => {
  const cache = new Map<string, string | null>();
  cache.set("1.21.9:minecraft:arrow", "https://old/arrow.png");
  const { fetchJson } = jsonFetcher({
    "items/arrow.json": { model: { model: "minecraft:item/arrow" } },
    "models/item/arrow.json": { textures: { layer0: "minecraft:item/arrow" } },
  });
  await expect(resolveItemTexture("minecraft:arrow", VERSION, { fetchJson, cache })).resolves.toBe(
    `${ASSET_CDN}@${VERSION}/assets/minecraft/textures/item/arrow.png`,
  );
});

test("unknown items resolve to null", async () => {
  const { fetchJson } = jsonFetcher({});
  await expect(resolveItemTexture("minecraft:definitely_not_an_item", VERSION, { fetchJson, cache: new Map() })).resolves.toBeNull();
});

test("empty fallback version is still a valid ref", () => {
  expect(FALLBACK_VERSION).toMatch(/^\d+\.\d+/);
});

test("uses the fallback model of a select item definition", async () => {
  const { fetchJson } = jsonFetcher({
    "items/diamond_helmet.json": {
      model: {
        type: "minecraft:select",
        cases: [
          {
            when: "minecraft:quartz",
            model: { type: "minecraft:model", model: "minecraft:item/diamond_helmet_quartz_trim" },
          },
        ],
        fallback: { type: "minecraft:model", model: "minecraft:item/diamond_helmet" },
      },
    },
    "models/item/diamond_helmet.json": {
      parent: "minecraft:item/generated",
      textures: { layer0: "minecraft:item/diamond_helmet" },
    },
  });

  await expect(resolveItemTexture("minecraft:diamond_helmet", VERSION, { fetchJson, cache: new Map() })).resolves.toBe(
    `${ASSET_CDN}@${VERSION}/assets/minecraft/textures/item/diamond_helmet.png`,
  );
});

test("uses the first case when a select has no fallback", async () => {
  const { fetchJson } = jsonFetcher({
    "items/trimmed.json": {
      model: {
        type: "minecraft:select",
        cases: [{ model: { type: "minecraft:model", model: "minecraft:item/trimmed" } }],
      },
    },
    "models/item/trimmed.json": { textures: { layer0: "minecraft:item/trimmed_base" } },
  });

  await expect(resolveItemTexture("minecraft:trimmed", VERSION, { fetchJson, cache: new Map() })).resolves.toBe(
    `${ASSET_CDN}@${VERSION}/assets/minecraft/textures/item/trimmed_base.png`,
  );
});

test("falls back to models/item when the item definition has no usable model", async () => {
  const { fetchJson } = jsonFetcher({
    "items/shield.json": { model: { type: "minecraft:special", model: { type: "minecraft:shield" } } },
    "models/item/shield.json": { textures: { layer0: "minecraft:item/shield" } },
  });

  await expect(resolveItemTexture("minecraft:shield", VERSION, { fetchJson, cache: new Map() })).resolves.toBe(
    `${ASSET_CDN}@${VERSION}/assets/minecraft/textures/item/shield.png`,
  );
});

test("a model that only names a particle texture has no icon", async () => {
  const { fetchJson } = jsonFetcher({
    "items/shield.json": {
      model: {
        type: "minecraft:condition",
        on_false: { type: "minecraft:special", base: "minecraft:item/shield" },
        on_true: { type: "minecraft:special", base: "minecraft:item/shield_blocking" },
      },
    },
    "models/item/shield.json": { textures: { particle: "minecraft:block/dark_oak_planks" } },
  });

  await expect(resolveItemTexture("minecraft:shield", VERSION, { fetchJson, cache: new Map() })).resolves.toBeNull();
});
