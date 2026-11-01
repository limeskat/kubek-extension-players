import { expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ItemSlot } from "./ItemSlot";

test("empty slot is labelled", () => {
  const html = renderToStaticMarkup(<ItemSlot item={null} />);
  expect(html).toContain("k-slot");
  expect(html).toContain('aria-label="Empty"');
  expect(html).not.toContain("<img");
});

test("item slot starts in the loading state and shows the count", () => {
  const html = renderToStaticMarkup(
    <ItemSlot item={{ id: "minecraft:diamond", displayName: "Diamond", count: 2 }} />,
  );
  expect(html).toContain("k-slot-loading");
  expect(html).toContain("Diamond");
  expect(html).toContain("x2");
  expect(html).toContain("k-slot-count");
  expect(html).toContain(">2<");
});

test("single items carry no count badge", () => {
  const html = renderToStaticMarkup(
    <ItemSlot item={{ id: "minecraft:diamond", displayName: "Diamond", count: 1 }} />,
  );
  expect(html).not.toContain("k-slot-count");
});
