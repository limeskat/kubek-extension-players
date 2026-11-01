import { expect, test } from "bun:test";
import { loadFlatModel, resolveTextureRef } from "./model";

test("child textures override parents and elements are inherited", async () => {
  const fetchJson = async (url: string) => {
    if (url.includes("models/block/oak_stairs.json")) {
      return {
        parent: "minecraft:block/stairs",
        textures: { bottom: "block/oak_planks", side: "block/oak_planks", top: "block/oak_planks" },
      };
    }
    if (url.includes("models/block/stairs.json")) {
      return {
        parent: "minecraft:block/block",
        elements: [{ from: [0, 0, 0], to: [16, 8, 16], faces: { up: { texture: "#bottom" } } }],
      };
    }
    return null;
  };

  const model = await loadFlatModel("block/oak_stairs", "26.2", fetchJson);

  expect(model?.elements).toHaveLength(1);
  expect(model?.textures.bottom).toBe("block/oak_planks");
});

test("a child element list wins over the parent", async () => {
  const fetchJson = async (url: string) => {
    if (url.includes("models/block/custom.json")) {
      return { parent: "minecraft:block/block", elements: [{ from: [0, 0, 0], to: [4, 4, 4] }] };
    }
    if (url.includes("models/block/block.json")) {
      return { elements: [{ from: [0, 0, 0], to: [16, 16, 16] }] };
    }
    return null;
  };

  const model = await loadFlatModel("block/custom", "26.2", fetchJson);
  expect(model?.elements).toHaveLength(1);
  expect(model?.elements[0].to).toEqual([4, 4, 4]);
});

test("texture variables resolve through #references", () => {
  const textures = { all: "block/cobblestone", side: "#all" };
  expect(resolveTextureRef("#side", textures)).toBe("minecraft:block/cobblestone");
  expect(resolveTextureRef("#missing", textures)).toBeNull();
  expect(resolveTextureRef("minecraft:block/dirt", textures)).toBe("minecraft:block/dirt");
  expect(resolveTextureRef("block/dirt", textures)).toBe("minecraft:block/dirt");
});

test("missing models return null", async () => {
  expect(await loadFlatModel("block/nope", "26.2", async () => null)).toBeNull();
});

test("models without elements are reported as flat", async () => {
  const model = await loadFlatModel("item/arrow", "26.2", async () => ({
    textures: { layer0: "minecraft:item/arrow" },
  }));
  expect(model?.elements).toEqual([]);
  expect(model?.textures.layer0).toBe("minecraft:item/arrow");
});

test("builtin parents are terminal and never fetched", async () => {
  const calls: string[] = [];
  const fetchJson = async (url: string) => {
    calls.push(url);
    if (url.includes("models/item/stick.json")) {
      return { parent: "builtin/generated", textures: { layer0: "minecraft:item/stick" } };
    }
    return null;
  };

  const model = await loadFlatModel("item/stick", "26.2", fetchJson);
  expect(model?.textures.layer0).toBe("minecraft:item/stick");
  expect(calls.some((url) => url.includes("builtin/generated"))).toBe(false);
});
