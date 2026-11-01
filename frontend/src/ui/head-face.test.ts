import { expect, test } from "bun:test";
import { generatedFacePixels } from "./head-face";

test("generatedFacePixels is deterministic per name and stays inside the 8x8 grid", () => {
  const a = generatedFacePixels("Notch");
  expect(generatedFacePixels("Notch")).toEqual(a);
  expect(a.length).toBeGreaterThan(5);
  for (const [x, y, w, h] of a) {
    expect(x + w).toBeLessThanOrEqual(8);
    expect(y + h).toBeLessThanOrEqual(8);
  }
});

test("different names produce different faces", () => {
  expect(generatedFacePixels("Notch")).not.toEqual(generatedFacePixels("Steve"));
});
