const TEXTURE_BASE =
  "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.9/assets/minecraft/textures";

/** Case-insensitive substring match against any of the given fields. */
export function matchesQuery(query: string, ...fields: Array<string | undefined>): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((field) => field?.toLowerCase().includes(q));
}

/** Item and block texture candidates for an item id such as `minecraft:diamond_sword`. */
export function itemTextureUrls(id: string): { item: string; block: string } {
  const clean = id.replace(/^[a-z0-9_]+:/i, "");
  return {
    item: `${TEXTURE_BASE}/item/${clean}.png`,
    block: `${TEXTURE_BASE}/block/${clean}.png`,
  };
}

/** One decimal, coordinates read the same way the debug screen shows them. */
export function formatCoordinate(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : "—";
}
