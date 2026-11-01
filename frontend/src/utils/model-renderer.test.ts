import { expect, test } from "bun:test";
import { faceShade, projectPoint } from "./model-renderer";

test("projects model coordinates isometrically", () => {
  const [x0, y0] = projectPoint(0, 0, 0);
  expect(x0).toBeCloseTo(0, 5);
  expect(y0).toBeCloseTo(0, 5);

  const [x1, y1] = projectPoint(16, 0, 0);
  expect(x1).toBeCloseTo(13.856, 2);
  expect(y1).toBeCloseTo(8, 5);

  const [x2, y2] = projectPoint(0, 16, 0);
  expect(x2).toBeCloseTo(0, 5);
  expect(y2).toBeCloseTo(-16, 5);

  const [x3, y3] = projectPoint(0, 0, 16);
  expect(x3).toBeCloseTo(-13.856, 2);
  expect(y3).toBeCloseTo(8, 5);
});

test("top faces are unshaded and side faces are darker", () => {
  expect(faceShade("up")).toBe(0);
  expect(faceShade("down")).toBeGreaterThan(faceShade("east"));
  expect(faceShade("east")).toBeGreaterThan(faceShade("north"));
  expect(faceShade("north")).toBeGreaterThan(0);
});
