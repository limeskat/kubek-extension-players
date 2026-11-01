/** Case-insensitive substring match against any of the given fields. */
export function matchesQuery(query: string, ...fields: Array<string | undefined>): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((field) => field?.toLowerCase().includes(q));
}

/** One decimal, coordinates read the same way the debug screen shows them. */
export function formatCoordinate(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : "—";
}
