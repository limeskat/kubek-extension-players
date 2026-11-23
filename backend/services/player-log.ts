/**
 * Join/leave lines differ between cores and mods. Vanilla and Paper print the player name
 * directly after the logger prefix, while EasyAuth-style setups print the same event as a
 * system chat line ("System chat: Steve joined the game"). The "logged in with entity id" and
 * "lost connection" lines are the most stable and win when both forms are present.
 */
const JOIN_PATTERNS = [
  // [06:00:09] [Server thread/INFO]: Steve[/203.0.113.5:41918] logged in with entity id 218562
  /\]:\s+([A-Za-z0-9_]{1,16})\[[^\]]*\]\s+logged in with entity id\b/i,
  // [06:00:09] [Server thread/INFO]: System chat: Steve joined the game
  /\]:\s+(?:\[[^\]]*\]\s+)*(?:System chat:\s+)?([A-Za-z0-9_]{1,16})\s+joined the game\b/i,
];

const LEAVE_PATTERNS = [
  // [06:00:49] [Server thread/INFO]: Steve lost connection: Disconnected
  /\]:\s+([A-Za-z0-9_]{1,16})\s+lost connection\b/i,
  // [06:00:49] [Server thread/INFO]: System chat: Steve left the game
  /\]:\s+(?:\[[^\]]*\]\s+)*(?:System chat:\s+)?([A-Za-z0-9_]{1,16})\s+left the game\b/i,
];

export type PlayerLogEvent = { action: "join" | "leave"; name: string };

/** Strip ANSI colours so log lines match regardless of the console output. */
export function stripAnsi(line: string): string {
  return line.replace(/\u001b\[[0-9;]*m/g, "");
}

/** Parse one server log line; null when it is not a join or leave event. */
export function parsePlayerLogLine(raw: string): PlayerLogEvent | null {
  if (!raw) return null;
  const line = stripAnsi(raw).replace(/\r$/, "");

  for (const pattern of JOIN_PATTERNS) {
    const match = line.match(pattern);
    if (match) return { action: "join", name: match[1] };
  }
  for (const pattern of LEAVE_PATTERNS) {
    const match = line.match(pattern);
    if (match) return { action: "leave", name: match[1] };
  }
  return null;
}
