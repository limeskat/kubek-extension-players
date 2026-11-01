export type ListEntry = {
  name?: string;
  ip?: string;
  uuid?: string;
  reason?: string;
};

/** The value the delete endpoint expects: a username, an IP or a UUID. */
export function listEntryIdentifier(entry: ListEntry): string {
  return entry.name || entry.ip || entry.uuid || "";
}

/** Request body for adding to any of the four lists. */
export function buildListPayload(value: string, reason?: string) {
  const trimmed = value.trim();
  return {
    name: trimmed,
    ip: trimmed,
    reason: reason?.trim() || undefined,
  };
}
