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

/**
 * A typed NBT node. Keeping the tag type is what makes it possible to rewrite a player
 * data file without corrupting fields we do not touch (floats vs doubles, byte enums…).
 */
export interface NbtNode {
  type: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

interface NbtList {
  itemType: number;
  items: NbtNode[];
}

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

  readNodePayload(type: number): NbtNode {
    switch (type) {
      case TAG_END:
        return { type, value: null };
      case TAG_BYTE:
        return { type, value: this.readByte() };
      case TAG_SHORT:
        return { type, value: this.readShort() };
      case TAG_INT:
        return { type, value: this.readInt() };
      case TAG_LONG:
        return { type, value: this.readLong() };
      case TAG_FLOAT:
        return { type, value: this.readFloat() };
      case TAG_DOUBLE:
        return { type, value: this.readDouble() };
      case TAG_BYTE_ARRAY:
        return { type, value: this.readByteArray() };
      case TAG_STRING:
        return { type, value: this.readString() };
      case TAG_LIST: {
        const itemType = this.readByte();
        const len = this.readInt();
        const items: NbtNode[] = [];
        for (let i = 0; i < len; i++) {
          items.push(this.readNodePayload(itemType));
        }
        return { type, value: { itemType, items } as NbtList };
      }
      case TAG_COMPOUND: {
        const value: Record<string, NbtNode> = {};
        while (this.offset < this.buffer.length) {
          const tagType = this.readByte();
          if (tagType === TAG_END) break;
          const name = this.readString();
          value[name] = this.readNodePayload(tagType);
        }
        return { type, value };
      }
      case TAG_INT_ARRAY:
        return { type, value: this.readIntArray() };
      case TAG_LONG_ARRAY:
        return { type, value: this.readLongArray() };
      default:
        throw new Error(`Unsupported NBT tag type: ${type}`);
    }
  }

  parseRootNode(): NbtNode | null {
    const rootType = this.readByte();
    if (rootType !== TAG_COMPOUND) return null;
    this.readString(); // root name is empty for player data
    return this.readNodePayload(rootType);
  }
}

class NbtWriter {
  private chunks: Buffer[] = [];

  private push(buf: Buffer): void {
    this.chunks.push(buf);
  }

  writeByte(value: number): void {
    const buf = Buffer.alloc(1);
    buf.writeInt8(value, 0);
    this.push(buf);
  }

  writeShort(value: number): void {
    const buf = Buffer.alloc(2);
    buf.writeInt16BE(value, 0);
    this.push(buf);
  }

  writeInt(value: number): void {
    const buf = Buffer.alloc(4);
    buf.writeInt32BE(value, 0);
    this.push(buf);
  }

  writeLong(value: bigint): void {
    const buf = Buffer.alloc(8);
    buf.writeBigInt64BE(BigInt(value), 0);
    this.push(buf);
  }

  writeFloat(value: number): void {
    const buf = Buffer.alloc(4);
    buf.writeFloatBE(value, 0);
    this.push(buf);
  }

  writeDouble(value: number): void {
    const buf = Buffer.alloc(8);
    buf.writeDoubleBE(value, 0);
    this.push(buf);
  }

  writeString(value: string): void {
    const buf = Buffer.from(value, "utf8");
    this.writeShort(buf.length);
    this.push(buf);
  }

  writeNodePayload(node: NbtNode): void {
    switch (node.type) {
      case TAG_END:
        return;
      case TAG_BYTE:
        this.writeByte(node.value);
        return;
      case TAG_SHORT:
        this.writeShort(node.value);
        return;
      case TAG_INT:
        this.writeInt(node.value);
        return;
      case TAG_LONG:
        this.writeLong(node.value);
        return;
      case TAG_FLOAT:
        this.writeFloat(node.value);
        return;
      case TAG_DOUBLE:
        this.writeDouble(node.value);
        return;
      case TAG_BYTE_ARRAY: {
        const arr = node.value as number[];
        this.writeInt(arr.length);
        for (const item of arr) this.writeByte(item);
        return;
      }
      case TAG_STRING:
        this.writeString(node.value);
        return;
      case TAG_LIST: {
        const list = node.value as NbtList;
        this.writeByte(list.itemType);
        this.writeInt(list.items.length);
        for (const item of list.items) this.writeNodePayload(item);
        return;
      }
      case TAG_COMPOUND: {
        const entries = node.value as Record<string, NbtNode>;
        for (const [name, child] of Object.entries(entries)) {
          this.writeByte(child.type);
          this.writeString(name);
          this.writeNodePayload(child);
        }
        this.writeByte(TAG_END);
        return;
      }
      case TAG_INT_ARRAY: {
        const arr = node.value as number[];
        this.writeInt(arr.length);
        for (const item of arr) this.writeInt(item);
        return;
      }
      case TAG_LONG_ARRAY: {
        const arr = node.value as bigint[];
        this.writeInt(arr.length);
        for (const item of arr) this.writeLong(item);
        return;
      }
      default:
        throw new Error(`Unsupported NBT tag type: ${node.type}`);
    }
  }

  serializeRoot(root: NbtNode): Buffer {
    if (root.type !== TAG_COMPOUND) {
      throw new Error("Player data root must be a TAG_Compound");
    }
    this.writeByte(TAG_COMPOUND);
    this.writeString("");
    this.writeNodePayload(root);
    return Buffer.concat(this.chunks);
  }
}

function toPlain(node: NbtNode): unknown {
  switch (node.type) {
    case TAG_LIST:
      return ((node.value as NbtList).items ?? []).map(toPlain);
    case TAG_COMPOUND: {
      const out: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(
        node.value as Record<string, NbtNode>,
      )) {
        out[key] = toPlain(child);
      }
      return out;
    }
    default:
      return node.value;
  }
}

function listOfDoubles(values: number[]): NbtNode {
  return {
    type: TAG_LIST,
    value: {
      itemType: TAG_DOUBLE,
      items: values.map((value) => ({ type: TAG_DOUBLE, value })),
    } as NbtList,
  };
}

export interface TeleportTarget {
  world: string;
  x: number;
  y: number;
  z: number;
}

const LEGACY_DIMENSION_IDS: Record<string, number> = {
  "minecraft:overworld": 0,
  "minecraft:the_nether": -1,
  "minecraft:the_end": 1,
};

export class NbtParserService {
  /**
   * Parse a gzipped Minecraft player data file (.dat) while keeping NBT tag types.
   */
  parsePlayerDataFileTyped(filePath: string): NbtNode | null {
    try {
      if (!fs.existsSync(filePath)) return null;
      const fileBuf = fs.readFileSync(filePath);
      const decompressed = zlib.gunzipSync(fileBuf);
      const reader = new NbtReader(decompressed);
      return reader.parseRootNode();
    } catch {
      return null;
    }
  }

  /**
   * Parse a gzipped Minecraft player data file (.dat)
   */
  parsePlayerDataFile(filePath: string): Record<string, unknown> | null {
    const node = this.parsePlayerDataFileTyped(filePath);
    if (!node) return null;
    const plain = toPlain(node);
    return plain && typeof plain === "object"
      ? (plain as Record<string, unknown>)
      : null;
  }

  /**
   * Write a typed NBT tree back as a gzipped player data file. Keeps one backup of the
   * original file the first time we touch it.
   */
  writePlayerDataFile(filePath: string, root: NbtNode): void {
    const writer = new NbtWriter();
    const raw = writer.serializeRoot(root);
    const compressed = zlib.gzipSync(raw);

    const backup = `${filePath}.teleport-backup`;
    try {
      if (fs.existsSync(filePath) && !fs.existsSync(backup)) {
        fs.copyFileSync(filePath, backup);
      }
    } catch {
      // a backup is best-effort, the write itself still has to succeed
    }

    const tmp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
    fs.writeFileSync(tmp, compressed);
    fs.renameSync(tmp, filePath);
  }

  /**
   * Move an offline player: Minecraft has no entity to run /tp against, so the position
   * is written to their player data and applied on the next join.
   */
  writePlayerTeleport(filePath: string, target: TeleportTarget): void {
    const root = this.parsePlayerDataFileTyped(filePath);
    if (!root || root.type !== TAG_COMPOUND) {
      throw new Error("Could not parse the player data file");
    }

    const data = root.value as Record<string, NbtNode>;
    data.Pos = listOfDoubles([target.x, target.y, target.z]);
    data.Motion = listOfDoubles([0, 0, 0]);
    data.FallDistance = { type: TAG_FLOAT, value: 0 };
    data.PortalCooldown = { type: TAG_INT, value: 0 };
    data.OnGround = { type: TAG_BYTE, value: 0 };

    const dimension = data.Dimension;
    if (dimension && dimension.type === TAG_INT) {
      const id = LEGACY_DIMENSION_IDS[target.world];
      if (id === undefined) {
        throw new Error(
          "This server stores dimensions as numeric IDs; custom dimensions are not supported.",
        );
      }
      data.Dimension = { type: TAG_INT, value: id };
    } else {
      data.Dimension = { type: TAG_STRING, value: target.world };
    }

    // A player who logged out in a vehicle must not be pulled back to it.
    delete data.RootVehicle;
    delete data.Vehicle;

    this.writePlayerDataFile(filePath, root);
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
   * Extract player inventory and equipment slots.
   *
   * Supports both the classic layout (armor in Inventory slots 100-103/-106, `Count`)
   * and the 1.21.9+ layout (equipment compound, lowercase `count`).
   */
  extractInventory(nbt: Record<string, unknown> | null): PlayerInventory {
    const emptyMain: (InventoryItem | null)[] = Array(27).fill(null);
    const emptyHotbar: (InventoryItem | null)[] = Array(9).fill(null);

    const inv: PlayerInventory = {
      armor: {},
      offhand: undefined,
      main: emptyMain,
      hotbar: emptyHotbar,
      enderChest: Array(27).fill(null),
    };

    const readItem = (
      raw: unknown,
      slot: number,
    ): InventoryItem | null => {
      if (!raw || typeof raw !== "object") return null;
      const item = raw as Record<string, unknown>;
      if (typeof item.id !== "string") return null;
      const count =
        typeof item.count === "number"
          ? item.count
          : typeof item.Count === "number"
            ? item.Count
            : 1;
      return {
        slot,
        id: item.id,
        count,
        displayName: this.formatItemName(item.id.replace(/^minecraft:/, "")),
      };
    };

    if (Array.isArray(nbt?.Inventory)) {
      for (const raw of nbt.Inventory as Record<string, unknown>[]) {
        if (!raw || typeof raw.Slot !== "number") continue;
        const slot = raw.Slot;
        const parsedItem = readItem(raw, slot);
        if (!parsedItem) continue;

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
    }

    // 1.21.9 moved worn equipment out of the Inventory list.
    const equipment = nbt?.equipment as Record<string, unknown> | undefined;
    if (equipment && typeof equipment === "object") {
      const helmet = readItem(equipment.head, 103);
      const chestplate = readItem(equipment.chest, 102);
      const leggings = readItem(equipment.legs, 101);
      const boots = readItem(equipment.feet, 100);
      const offhand = readItem(equipment.offhand, -106);
      if (helmet) inv.armor.helmet = helmet;
      if (chestplate) inv.armor.chestplate = chestplate;
      if (leggings) inv.armor.leggings = leggings;
      if (boots) inv.armor.boots = boots;
      if (offhand) inv.offhand = offhand;
    }

    if (Array.isArray(nbt?.EnderItems)) {
      const enderList: (InventoryItem | null)[] = Array(27).fill(null);
      for (const raw of nbt.EnderItems as Record<string, unknown>[]) {
        if (!raw || typeof raw.Slot !== "number") continue;
        if (raw.Slot >= 0 && raw.Slot < 27) {
          enderList[raw.Slot] = readItem(raw, raw.Slot);
        }
      }
      inv.enderChest = enderList;
    }

    return inv;
  }

  /**
   * Extract the last death position, stored by Minecraft since 1.19.
   */
  extractLastDeath(nbt: Record<string, unknown> | null): LocationData | null {
    if (!nbt) return null;
    const death = nbt.LastDeathLocation as Record<string, unknown> | undefined;
    if (!death || typeof death !== "object") return null;

    const pos = death.pos;
    if (!Array.isArray(pos) || pos.length < 3) return null;

    return {
      world:
        typeof death.dimension === "string"
          ? death.dimension
          : "minecraft:overworld",
      x: Number(pos[0]) || 0,
      y: Number(pos[1]) || 0,
      z: Number(pos[2]) || 0,
    };
  }

  private formatItemName(id: string): string {
    return id
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
}
