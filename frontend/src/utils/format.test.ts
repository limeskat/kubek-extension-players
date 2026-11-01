import { expect, test } from "bun:test";
import { formatCoordinate, itemTextureUrls, matchesQuery } from "./format";

test("matchesQuery is case-insensitive, trims and matches any field", () => {
  expect(matchesQuery("  NOT ", "Notch", "069a79f4")).toBe(true);
  expect(matchesQuery("069a", "Notch", "069a79f4-44e9")).toBe(true);
  expect(matchesQuery("", "Notch")).toBe(true);
  expect(matchesQuery("steve", "Notch")).toBe(false);
});

test("itemTextureUrls strips the namespace and offers item then block", () => {
  const urls = itemTextureUrls("minecraft:diamond_sword");
  expect(urls.item).toBe("https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.9/assets/minecraft/textures/item/diamond_sword.png");
  expect(urls.block).toBe("https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.9/assets/minecraft/textures/block/diamond_sword.png");
});

test("formatCoordinate keeps one decimal", () => {
  expect(formatCoordinate(-189.34)).toBe("-189.3");
  expect(formatCoordinate(64)).toBe("64.0");
});
