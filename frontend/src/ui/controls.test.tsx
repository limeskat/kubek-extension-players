import { expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TabBar } from "./tabs";
import { PlayerHead } from "./player-head";
import { SearchInput } from "./search-input";
import { Switch } from "./switch";
import { useKubek } from "./kubek";

const items = [
  { id: "online", label: "Online", count: 2 },
  { id: "all", label: "All players", count: 0 },
];

test("tab bar marks the active tab and hides zero counts", () => {
  const html = renderToStaticMarkup(
    <TabBar items={items} value="online" onChange={() => {}} label="Player lists" />,
  );
  expect(html).toContain('role="tablist"');
  expect(html).toContain('aria-label="Player lists"');
  expect(html.match(/role="tab"/g)).toHaveLength(2);
  expect(html).toContain('aria-selected="true"');
  expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
  expect(html.match(/k-tab-count/g)).toHaveLength(1);
});

test("player head points at the panel head endpoint", () => {
  const html = renderToStaticMarkup(<PlayerHead name="Notch" />);
  expect(html).toContain('src="/api/heads/Notch"');
  expect(html).toContain("k-head-pixel");
});

test("player head falls back to a generated face for invalid names", () => {
  const html = renderToStaticMarkup(<PlayerHead name={"a".repeat(17)} />);
  expect(html).toContain("<svg");
  expect(html).not.toContain("<img");
});

test("search input exposes its label and placeholder", () => {
  const html = renderToStaticMarkup(
    <SearchInput value="" onChange={() => {}} placeholder="Search players" label="Search" />,
  );
  expect(html).toContain('aria-label="Search"');
  expect(html).toContain('placeholder="Search players"');
});

test("switch reports its state and disabled attribute", () => {
  const on = renderToStaticMarkup(
    <Switch checked onChange={() => {}} label="Whitelist" disabled />,
  );
  expect(on).toContain('role="switch"');
  expect(on).toContain('aria-checked="true"');
  expect(on).toContain("disabled");
  const off = renderToStaticMarkup(<Switch checked={false} onChange={() => {}} label="Whitelist" />);
  expect(off).toContain('aria-checked="false"');
  expect(off).not.toContain("disabled");
});

test("useKubek reads the window global without throwing", () => {
  const g = globalThis as { window?: unknown };
  const previous = g.window;
  try {
    delete g.window;
    expect(useKubek()).toBeUndefined();
    const marker = { React: {} };
    g.window = { Kubek: marker };
    expect(useKubek()).toBe(marker as never);
  } finally {
    g.window = previous;
  }
});
