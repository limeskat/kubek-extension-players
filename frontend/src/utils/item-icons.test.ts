import { expect, test } from "bun:test";
import { apiItemUrl, versionAtLeast } from "./item-icons";

test("apiItemUrl only builds urls for vanilla item ids", () => {
  expect(apiItemUrl("minecraft:diamond_sword")).toBe(
    "https://api.minecraftitems.xyz/api/item/diamond_sword",
  );
  expect(apiItemUrl("create:brass_ingot")).toBeNull();
  expect(apiItemUrl("minecraft:bad id")).toBeNull();
});

test("versionAtLeast compares numeric segments", () => {
  expect(versionAtLeast("26.2", "1.21.4")).toBe(true);
  expect(versionAtLeast("1.21.4", "1.21.4")).toBe(true);
  expect(versionAtLeast("1.21.3", "1.21.4")).toBe(false);
  expect(versionAtLeast("1.20.1", "1.21.4")).toBe(false);
  expect(versionAtLeast("", "1.21.4")).toBe(false);
});
