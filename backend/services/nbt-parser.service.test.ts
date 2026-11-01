import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NbtParserService, type NbtNode } from "./nbt-parser.service";

const nbt = new NbtParserService();

const dbl = (value: number): NbtNode => ({ type: 6, value });
const listOfDouble = (values: number[]): NbtNode => ({
  type: 9,
  value: { itemType: 6, items: values.map(dbl) },
});

function tempFile(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kubek-nbt-"));
  return path.join(dir, "player.dat");
}

describe("NbtParserService inventory", () => {
  test("reads the 1.21.9 item format (lowercase count) and equipment compound", () => {
    const parsed = {
      Inventory: [
        { Slot: 0, id: "minecraft:wheat", count: 9 },
        { Slot: 36, id: "minecraft:stone_axe", count: 1 },
      ],
      equipment: {
        head: { id: "minecraft:copper_helmet", count: 1 },
        chest: { id: "minecraft:copper_chestplate", count: 1 },
        legs: { id: "minecraft:copper_leggings", count: 1 },
        feet: { id: "minecraft:copper_boots", count: 1 },
        offhand: { id: "minecraft:shield", count: 1 },
      },
      EnderItems: [{ Slot: 3, id: "minecraft:diamond", count: 5 }],
    };

    const inv = nbt.extractInventory(parsed);
    expect(inv.hotbar[0]).toMatchObject({ id: "minecraft:wheat", count: 9 });
    expect(inv.armor.helmet).toMatchObject({ id: "minecraft:copper_helmet", count: 1 });
    expect(inv.armor.chestplate).toMatchObject({ id: "minecraft:copper_chestplate" });
    expect(inv.armor.leggings).toMatchObject({ id: "minecraft:copper_leggings" });
    expect(inv.armor.boots).toMatchObject({ id: "minecraft:copper_boots" });
    expect(inv.offhand).toMatchObject({ id: "minecraft:shield" });
    expect(inv.enderChest?.[3]).toMatchObject({ id: "minecraft:diamond", count: 5 });
  });

  test("still reads the classic item format (uppercase Count, armor slots)", () => {
    const parsed = {
      Inventory: [
        { Slot: 0, id: "minecraft:bread", Count: 12 },
        { Slot: 100, id: "minecraft:iron_boots", Count: 1 },
        { Slot: 103, id: "minecraft:iron_helmet", Count: 1 },
        { Slot: -106, id: "minecraft:shield", Count: 1 },
      ],
      EnderItems: [{ Slot: 0, id: "minecraft:ender_pearl", Count: 16 }],
    };

    const inv = nbt.extractInventory(parsed);
    expect(inv.hotbar[0]).toMatchObject({ id: "minecraft:bread", count: 12 });
    expect(inv.armor.boots).toMatchObject({ id: "minecraft:iron_boots" });
    expect(inv.armor.helmet).toMatchObject({ id: "minecraft:iron_helmet" });
    expect(inv.offhand).toMatchObject({ id: "minecraft:shield" });
    expect(inv.enderChest?.[0]).toMatchObject({ id: "minecraft:ender_pearl", count: 16 });
  });
});

describe("NbtParserService last death", () => {
  test("extracts LastDeathLocation", () => {
    expect(
      nbt.extractLastDeath({
        LastDeathLocation: { pos: [106, 116, 19], dimension: "minecraft:overworld" },
      }),
    ).toEqual({ world: "minecraft:overworld", x: 106, y: 116, z: 19 });
  });

  test("returns null when the player never died", () => {
    expect(nbt.extractLastDeath({})).toBeNull();
    expect(nbt.extractLastDeath(null)).toBeNull();
  });
});

describe("NbtParserService offline teleport", () => {
  function baseRoot(dimension: NbtNode): NbtNode {
    return {
      type: 10,
      value: {
        DataVersion: { type: 3, value: 4903 },
        Health: { type: 5, value: 18.5 },
        Pos: listOfDouble([-194.7, 64, -212.3]),
        Motion: listOfDouble([0, -0.07, 0]),
        Dimension: dimension,
        Inventory: {
          type: 9,
          value: {
            itemType: 10,
            items: [
              {
                type: 10,
                value: {
                  Slot: { type: 1, value: 0 },
                  id: { type: 8, value: "minecraft:stone" },
                  count: { type: 1, value: 12 },
                },
              },
            ],
          },
        },
        equipment: {
          type: 10,
          value: {
            head: {
              type: 10,
              value: {
                id: { type: 8, value: "minecraft:copper_helmet" },
                count: { type: 1, value: 1 },
              },
            },
          },
        },
      },
    };
  }

  test("writes a new position and keeps the rest of the file intact", () => {
    const file = tempFile();
    nbt.writePlayerDataFile(file, baseRoot({ type: 8, value: "minecraft:overworld" }));
    nbt.writePlayerTeleport(file, { world: "minecraft:the_nether", x: 10, y: 70, z: -5 });

    const parsed = nbt.parsePlayerDataFile(file)!;
    expect(parsed.Pos).toEqual([10, 70, -5]);
    expect(parsed.Dimension).toBe("minecraft:the_nether");
    expect(parsed.Motion).toEqual([0, 0, 0]);
    expect(parsed.Health).toBe(18.5);
    expect(parsed.DataVersion).toBe(4903);

    const inv = nbt.extractInventory(parsed);
    expect(inv.hotbar[0]).toMatchObject({ id: "minecraft:stone", count: 12 });
    expect(inv.armor.helmet).toMatchObject({ id: "minecraft:copper_helmet" });
    expect(fs.existsSync(`${file}.teleport-backup`)).toBe(true);
  });

  test("maps vanilla dimensions for old numeric Dimension tags", () => {
    const file = tempFile();
    nbt.writePlayerDataFile(file, baseRoot({ type: 3, value: 0 }));
    nbt.writePlayerTeleport(file, { world: "minecraft:the_end", x: 0, y: 100, z: 0 });
    expect(nbt.parsePlayerDataFile(file)!.Dimension).toBe(1);
  });

  test("refuses custom dimensions when the server uses numeric Dimension tags", () => {
    const file = tempFile();
    nbt.writePlayerDataFile(file, baseRoot({ type: 3, value: 0 }));
    expect(() =>
      nbt.writePlayerTeleport(file, { world: "custom:skylands", x: 0, y: 100, z: 0 }),
    ).toThrow();
  });
});
