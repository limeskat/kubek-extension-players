import fs from "node:fs";
import zlib from "node:zlib";
import type {
  Dimension,
  Gamemode,
  InventoryItem,
  LocationData,
  PlayerInventory,
  PlayerVitals,
} from "../types";

// NBT Tag IDs
const TAG_END = 0;
const TAG_BYTE = 1;
const TAG_SHORT = 2;
const TAG_INT = 3;
const TAG_LONG = 4;
const TAG_FLOAT = 5;
const TAG_DOUBLE = 6;
const TAG_BYTE_ARRAY = 7;
const TAG_STRING = 8;
const TAG_LIST = 9;
const TAG_COMPOUND = 10;
const TAG_INT_ARRAY = 11;
const TAG_LONG_ARRAY = 12;

class NbtReader {
  private offset = 0;

  constructor(private buffer: Buffer) {}

  readByte(): number {
    const val = this.buffer.readInt8(this.offset);
    this.offset += 1;
    return val;
  }

  readUByte(): number {
    const val = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    return val;
  }

  readShort(): number {
    const val = this.buffer.readInt16BE(this.offset);
    this.offset += 2;
    return val;
  }

  readInt(): number {
    const val = this.buffer.readInt32BE(this.offset);
    this.offset += 4;
    return val;
  }

  readLong(): bigint {
    const val = this.buffer.readBigInt64BE(this.offset);
    this.offset += 8;
    return val;
  }

  readFloat(): number {
    const val = this.buffer.readFloatBE(this.offset);
    this.offset += 4;
    return val;
  }

  readDouble(): number {
    const val = this.buffer.readDoubleBE(this.offset);
    this.offset += 8;
    return val;
  }

  readString(): string {
    const len = this.readShort();
    if (len <= 0) return "";
    const str = this.buffer.toString(
      "utf8",
      this.offset,
      this.offset + len,
    );
    this.offset += len;
    return str;
  }

  readByteArray(): number[] {
    const len = this.readInt();
    const arr: number[] = [];
    for (let i = 0; i < len; i++) {
      arr.push(this.readByte());
    }
    return arr;
  }

  readIntArray(): number[] {
    const len = this.readInt();
    const arr: number[] = [];
    for (let i = 0; i < len; i++) {
      arr.push(this.readInt());
    }
    return arr;
  }

  readLongArray(): bigint[] {
    const len = this.readInt();
    const arr: bigint[] = [];
    for (let i = 0; i < len; i++) {
      arr.push(this.readLong());
    }
    return arr;
  }

  readList(): unknown[] {
    const itemType = this.readByte();
    const len = this.readInt();
    const list: unknown[] = [];
    if (len <= 0) return list;
    for (let i = 0; i < len; i++) {
      list.push(this.readTagPayload(itemType));
    }
    return list;
  }

  readCompound(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    while (this.offset < this.buffer.length) {
      const tagType = this.readByte();
      if (tagType === TAG_END) break;
      const name = this.readString();
      const value = this.readTagPayload(tagType);
      obj[name] = value;
    }
    return obj;
  }

  readTagPayload(type: number): unknown {
    switch (type) {
      case TAG_BYTE:
        return this.readByte();
      case TAG_SHORT:
        return this.readShort();
      case TAG_INT:
        return this.readInt();
      case TAG_LONG:
        return this.readLong();
      case TAG_FLOAT:
        return this.readFloat();
      case TAG_DOUBLE:
        return this.readDouble();
      case TAG_BYTE_ARRAY:
        return this.readByteArray();
      case TAG_STRING:
        return this.readString();
      case TAG_LIST:
        return this.readList();
      case TAG_COMPOUND:
        return this.readCompound();
      case TAG_INT_ARRAY:
        return this.readIntArray();
      case TAG_LONG_ARRAY:
        return this.readLongArray();
      default:
        return null;
    }
  }

  parseRoot(): Record<string, unknown> {
    const rootType = this.readByte();
    if (rootType !== TAG_COMPOUND) return {};
    this.readString(); // root name
    return this.readCompound();
  }
}

export class NbtParserService {
  /**
   * Parse a gzipped Minecraft player data file (.dat)
   */
  parsePlayerDataFile(filePath: string): Record<string, unknown> | null {
    try {
      if (!fs.existsSync(filePath)) return null;
      const fileBuf = fs.readFileSync(filePath);
      const decompressed = zlib.gunzipSync(fileBuf);
      const reader = new NbtReader(decompressed);
      return reader.parseRoot();
    } catch {
      return null;
    }
  }

  /**
   * Extract standardized PlayerVitals from parsed NBT
   */
  extractVitals(nbt: Record<string, unknown> | null): PlayerVitals {
    if (!nbt) {
      return { level: 0, xpProgress: 0, health: 20, food: 20 };
    }
    const health = typeof nbt.Health === "number" ? nbt.Health : 20;
    const food = typeof nbt.foodLevel === "number" ? nbt.foodLevel : 20;
    const level = typeof nbt.XpLevel === "number" ? nbt.XpLevel : 0;
    const xpProgress = typeof nbt.XpP === "number" ? nbt.XpP : 0;

    return {
      health: Math.max(0, Math.min(20, Math.round(health))),
      food: Math.max(0, Math.min(20, Math.round(food))),
      level: Math.max(0, level),
      xpProgress: Math.max(0, Math.min(1, xpProgress)),
    };
  }

  /**
   * Extract player location & dimension from parsed NBT
   */
  extractLocation(nbt: Record<string, unknown> | null): LocationData {
    if (!nbt) {
      return { world: "minecraft:overworld", x: 0, y: 64, z: 0 };
    }
    let world: Dimension = "minecraft:overworld";
    if (typeof nbt.Dimension === "string") {
      world = nbt.Dimension;
    } else if (typeof nbt.Dimension === "number") {
      if (nbt.Dimension === -1) world = "minecraft:the_nether";
      else if (nbt.Dimension === 1) world = "minecraft:the_end";
      else world = "minecraft:overworld";
    }

    let x = 0;
    let y = 64;
    let z = 0;
    if (Array.isArray(nbt.Pos) && nbt.Pos.length >= 3) {
      x = +(Number(nbt.Pos[0]) || 0).toFixed(2);
      y = +(Number(nbt.Pos[1]) || 0).toFixed(2);
      z = +(Number(nbt.Pos[2]) || 0).toFixed(2);
    }

    return { world, x, y, z };
  }

  /**
   * Extract gamemode from parsed NBT (0: Survival, 1: Creative, 2: Adventure, 3: Spectator)
   */
  extractGamemode(nbt: Record<string, unknown> | null): Gamemode {
    if (!nbt || typeof nbt.playerGameType !== "number") return "Survival";
    switch (nbt.playerGameType) {
      case 1:
        return "Creative";
      case 2:
        return "Adventure";
      case 3:
        return "Spectator";
      default:
        return "Survival";
    }
  }

  /**
   * Extract player inventory and equipment slots
   */
  extractInventory(nbt: Record<string, unknown> | null): PlayerInventory {
    const emptyMain: (InventoryItem | null)[] = Array(27).fill(null);
    const emptyHotbar: (InventoryItem | null)[] = Array(9).fill(null);

    const inv: PlayerInventory = {
      armor: {},
      offhand: undefined,
      main: emptyMain,
      hotbar: emptyHotbar,
      enderChest: [],
    };

    if (!nbt || !Array.isArray(nbt.Inventory)) return inv;

    for (const item of nbt.Inventory as Record<string, unknown>[]) {
      if (!item || typeof item.Slot !== "number" || typeof item.id !== "string") {
        continue;
      }
      const slot = item.Slot;
      const count = typeof item.Count === "number" ? item.Count : 1;
      const id = item.id.replace(/^minecraft:/, "");
      const cleanId = item.id;

      const parsedItem: InventoryItem = {
        slot,
        id: cleanId,
        count,
        displayName: this.formatItemName(id),
      };

      if (slot >= 0 && slot <= 8) {
        inv.hotbar[slot] = parsedItem;
      } else if (slot >= 9 && slot <= 35) {
        inv.main[slot - 9] = parsedItem;
      } else if (slot === 100) {
        inv.armor.boots = parsedItem;
      } else if (slot === 101) {
        inv.armor.leggings = parsedItem;
      } else if (slot === 102) {
        inv.armor.chestplate = parsedItem;
      } else if (slot === 103) {
        inv.armor.helmet = parsedItem;
      } else if (slot === -106) {
        inv.offhand = parsedItem;
      }
    }

    if (Array.isArray(nbt.EnderItems)) {
      const enderList: (InventoryItem | null)[] = Array(27).fill(null);
      for (const item of nbt.EnderItems as Record<string, unknown>[]) {
        if (!item || typeof item.Slot !== "number" || typeof item.id !== "string") {
          continue;
        }
        if (item.Slot >= 0 && item.Slot < 27) {
          enderList[item.Slot] = {
            slot: item.Slot,
            id: item.id,
            count: typeof item.Count === "number" ? item.Count : 1,
            displayName: this.formatItemName(item.id.replace(/^minecraft:/, "")),
          };
        }
      }
      inv.enderChest = enderList;
    }

    return inv;
  }

  private formatItemName(id: string): string {
    return id
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
}
