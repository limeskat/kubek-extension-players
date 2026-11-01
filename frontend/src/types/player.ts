/** Shapes returned by the extension backend. Mirrors the docs in the design spec. */

export interface PlayerSummary {
  uuid: string;
  username: string;
  isOnline: boolean;
  skinAvatarUrl?: string;
}

export interface PlayerVitals {
  level: number;
  xpProgress: number;
  health: number;
  food: number;
}

export interface PlayerLocation {
  world: string;
  x: number;
  y: number;
  z: number;
}

export interface InventoryItem {
  id: string;
  displayName?: string;
  count?: number;
}

export type ArmorSlot = "helmet" | "chestplate" | "leggings" | "boots";

export interface PlayerInventory {
  armor: Record<ArmorSlot, InventoryItem | null>;
  offhand: InventoryItem | null;
  main: Array<InventoryItem | null>;
  hotbar: Array<InventoryItem | null>;
  enderChest: Array<InventoryItem | null>;
}

export interface PlayerStats {
  playtimeText: string;
  playerKills: number;
  deaths: number;
  kdr: number;
  distanceTotal: number;
  distanceSprinted: number;
  distanceWalked: number;
  blocksBroken: number;
  itemsUsed: number;
  entitiesKilled: number;
}

export interface PlayerPermissions {
  isWhitelisted: boolean;
  isOp: boolean;
  isBanned: boolean;
}

export interface PlayerDetails {
  summary: PlayerSummary;
  gamemode?: string;
  vitals?: PlayerVitals;
  permissions?: PlayerPermissions;
  location?: PlayerLocation;
  lastDeath?: PlayerLocation | null;
  inventory?: PlayerInventory;
  stats?: PlayerStats;
  lastRefreshedText?: string;
  dataUpdatedAt?: string;
}
