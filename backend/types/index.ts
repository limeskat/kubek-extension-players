export type Gamemode = "Survival" | "Creative" | "Adventure" | "Spectator";

export type Dimension =
  | "minecraft:overworld"
  | "minecraft:the_nether"
  | "minecraft:the_end"
  | string;

export interface PlayerSummary {
  uuid: string;
  username: string;
  isOnline: boolean;
  skinAvatarUrl: string;
  lastSeen?: string;
  ping?: number;
}

export interface PlayerVitals {
  level: number;
  xpProgress: number; // 0.0 to 1.0
  health: number; // 0 to 20
  food: number; // 0 to 20
}

export interface PlayerPermissions {
  isWhitelisted: boolean;
  isBanned: boolean;
  isOp: boolean;
}

export interface LocationData {
  world: Dimension;
  x: number;
  y: number;
  z: number;
}

export interface InventoryItem {
  slot: number;
  id: string;
  count: number;
  displayName?: string;
  iconUrl?: string;
  nbt?: Record<string, unknown>;
}

export interface PlayerInventory {
  armor: {
    helmet?: InventoryItem;
    chestplate?: InventoryItem;
    leggings?: InventoryItem;
    boots?: InventoryItem;
  };
  offhand?: InventoryItem;
  main: (InventoryItem | null)[]; // 27 slots
  hotbar: (InventoryItem | null)[]; // 9 slots
  enderChest?: (InventoryItem | null)[];
}

export interface PlayerStats {
  playtimeText: string;
  playerKills: number;
  deaths: number;
  kdr: number;
  distanceTotal: number;
  distanceSprinted: number;
  distanceWalked: number;
  blocksBroken: number | null;
  itemsUsed: number | null;
  entitiesKilled: number | null;
}

export interface PlayerDetails {
  summary: PlayerSummary;
  gamemode: Gamemode;
  vitals: PlayerVitals;
  permissions: PlayerPermissions;
  location: LocationData;
  lastDeath: LocationData | null;
  inventory: PlayerInventory;
  stats: PlayerStats;
  lastRefreshedText: string;
  /** When the .dat file was last written by the server (null when no data file exists). */
  dataUpdatedAt: string | null;
}

export interface PurgeDataOptions {
  playerDataFile?: boolean;
  statisticsFile?: boolean;
  advancementsFile?: boolean;
}

export interface WhitelistEntry {
  uuid?: string;
  name: string;
}

export interface OpEntry {
  uuid?: string;
  name: string;
  level?: number;
  bypassesPlayerLimit?: boolean;
}

export interface BannedPlayerEntry {
  uuid?: string;
  name: string;
  created?: string;
  source?: string;
  expires?: string;
  reason?: string;
}

export interface BannedIpEntry {
  ip: string;
  created?: string;
  source?: string;
  expires?: string;
  reason?: string;
}

export interface UserCacheEntry {
  uuid: string;
  name: string;
  expiresOn?: string;
}
