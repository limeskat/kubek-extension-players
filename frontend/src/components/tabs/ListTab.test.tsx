import { expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ListTab } from "./ListTab";

test("a non-empty list with no matches says so instead of claiming to be empty", () => {
  const html = renderToStaticMarkup(
    <ListTab
      meta="3 entries"
      total={3}
      shown={0}
      query="zzz"
      onQuery={() => {}}
      empty={{ title: "The whitelist is empty" }}
      noMatches={{ title: "No matches", hint: "Try another name." }}
    >
      <div />
    </ListTab>,
  );
  expect(html).toContain("No matches");
  expect(html).toContain("Try another name.");
  expect(html).not.toContain("The whitelist is empty");
});

test("an empty list shows its own empty state", () => {
  const html = renderToStaticMarkup(
    <ListTab
      meta="0 entries"
      total={0}
      shown={0}
      query=""
      onQuery={() => {}}
      empty={{ title: "The whitelist is empty" }}
      noMatches={{ title: "No matches" }}
    >
      <div />
    </ListTab>,
  );
  expect(html).toContain("The whitelist is empty");
  expect(html).not.toContain("No matches");
});
