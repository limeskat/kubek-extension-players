import { expect, test } from "bun:test";
import { formatCoordinate, matchesQuery } from "./format";

test("matchesQuery is case-insensitive, trims and matches any field", () => {
  expect(matchesQuery("  NOT ", "Notch", "069a79f4")).toBe(true);
  expect(matchesQuery("069a", "Notch", "069a79f4-44e9")).toBe(true);
  expect(matchesQuery("", "Notch")).toBe(true);
  expect(matchesQuery("steve", "Notch")).toBe(false);
});

test("formatCoordinate keeps one decimal", () => {
  expect(formatCoordinate(-189.34)).toBe("-189.3");
  expect(formatCoordinate(64)).toBe("64.0");
});
