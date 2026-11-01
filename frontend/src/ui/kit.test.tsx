import { expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Panel, PanelHead, PanelMeta } from "./panel";
import { Stat, StatStrip } from "./stat-strip";
import { Plate } from "./plate";
import { PageHeader } from "./page-header";

test("panel renders the surface, head and meta slots", () => {
  const html = renderToStaticMarkup(
    <Panel>
      <PanelHead>
        <PanelMeta>9 players</PanelMeta>
      </PanelHead>
    </Panel>,
  );
  expect(html).toContain("k-panel");
  expect(html).toContain("k-panel-head");
  expect(html).toContain("9 players");
});

test("stat renders value, unit and becomes a button only when clickable", () => {
  const plain = renderToStaticMarkup(
    <StatStrip>
      <Stat label="Online" value={2} tone="green" />
    </StatStrip>,
  );
  expect(plain).toContain("k-strip");
  expect(plain).toContain("k-stat");
  expect(plain).not.toContain("<button");

  const clickable = renderToStaticMarkup(<Stat label="Online" value={2} onClick={() => {}} />);
  expect(clickable).toContain("<button");
  expect(clickable).toContain('type="button"');
});

test("plate carries its tone and size classes", () => {
  const html = renderToStaticMarkup(
    <Plate tone="red" size="sm">
      x
    </Plate>,
  );
  expect(html).toContain("k-plate-sm");
  expect(html).toContain("k-tone-red");
});

test("page header renders title, description and actions", () => {
  const html = renderToStaticMarkup(
    <PageHeader title="Players" description="Manage access" actions={<span>act</span>} />,
  );
  expect(html).toContain("<h1");
  expect(html).toContain("Players");
  expect(html).toContain("Manage access");
  expect(html).toContain("act");
});
