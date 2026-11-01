import { expect, test } from "bun:test";
import { buildListPayload, listEntryIdentifier } from "./list-helpers";

test("listEntryIdentifier prefers name, then ip, then uuid", () => {
  expect(listEntryIdentifier({ name: "Notch", ip: "1.2.3.4", uuid: "u" })).toBe("Notch");
  expect(listEntryIdentifier({ ip: "1.2.3.4", uuid: "u" })).toBe("1.2.3.4");
  expect(listEntryIdentifier({ uuid: "u" })).toBe("u");
  expect(listEntryIdentifier({})).toBe("");
});

test("buildListPayload trims and omits an empty reason", () => {
  expect(buildListPayload("  Notch  ", "  griefing  ")).toEqual({
    name: "Notch",
    ip: "Notch",
    reason: "griefing",
  });
  expect(buildListPayload("1.2.3.4", "   ")).toEqual({
    name: "1.2.3.4",
    ip: "1.2.3.4",
    reason: undefined,
  });
});
