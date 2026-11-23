import { describe, expect, test } from "bun:test";
import { parsePlayerLogLine } from "./player-log";

const parse = (line: string) => parsePlayerLogLine(line);

describe("player log parser", () => {
  test("reads vanilla join and leave lines", () => {
    expect(parse("[12:00:00] [Server thread/INFO]: Alex joined the game")).toEqual({
      action: "join",
      name: "Alex",
    });
    expect(parse("[12:01:00] [Server thread/INFO]: Alex left the game")).toEqual({
      action: "leave",
      name: "Alex",
    });
    expect(parse("[12:02:00] [Server thread/INFO]: Alex lost connection: Disconnected")).toEqual({
      action: "leave",
      name: "Alex",
    });
  });

  test("reads system chat join/leave lines used by EasyAuth-style servers", () => {
    expect(
      parse("[06:00:09] [Server thread/INFO]: System chat: deiwos joined the game"),
    ).toEqual({ action: "join", name: "deiwos" });
    expect(
      parse("[06:00:49] [Server thread/INFO]: System chat: deiwos left the game"),
    ).toEqual({ action: "leave", name: "deiwos" });
  });

  test("reads the logged-in line even when the join message is customised", () => {
    expect(
      parse(
        "[06:00:09] [Server thread/INFO]: deiwos[/103.170.200.79:41918] logged in with entity id 218562 at (20.26, 111.0, 5.68)",
      ),
    ).toEqual({ action: "join", name: "deiwos" });
  });

  test("strips ANSI colours", () => {
    expect(parse("[12:00:00] [Server thread/INFO]: \u001b[32mSteve joined the game\u001b[0m")).toEqual({
      action: "join",
      name: "Steve",
    });
  });

  test("ignores chat messages that mention joining", () => {
    expect(parse("[12:00:00] [Server thread/INFO]: <Alex> I joined the game yesterday")).toBeNull();
    expect(parse("[12:00:00] [Server thread/INFO]: <Alex> Steve joined the game")).toBeNull();
    expect(parse("[12:00:00] [Server thread/INFO]: System chat: <Alex> Bob joined the game")).toBeNull();
  });

  test("ignores unrelated lines", () => {
    expect(parse("[12:00:00] [Server thread/INFO]: Starting minecraft server version 1.21.9")).toBeNull();
    expect(parse("")).toBeNull();
  });
});
