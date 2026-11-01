import { expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PlayerRow } from "./PlayerRow";

test("row renders name, uuid, copy button, badges and detail", () => {
  const html = renderToStaticMarkup(
    <PlayerRow
      name="Notch"
      uuid="069a79f4-44e9-4726-a5be-fca90e38aaf5"
      badges={<span>OP</span>}
      detail="2h ago"
      actions={<button type="button">act</button>}
    />,
  );
  expect(html).toContain("k-row");
  expect(html).toContain("Notch");
  expect(html).toContain("069a79f4");
  expect(html).toContain('aria-label="Copy UUID"');
  expect(html).toContain("OP");
  expect(html).toContain("2h ago");
  expect(html).toContain("act");
});

test("row without a uuid hides the uuid line", () => {
  const html = renderToStaticMarkup(<PlayerRow name="Notch" />);
  expect(html).not.toContain("k-row-uuid");
  expect(html).not.toContain("Copy UUID");
});
