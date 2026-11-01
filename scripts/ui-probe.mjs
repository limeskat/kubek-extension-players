#!/usr/bin/env node
// Visual probe for the Players extension page.
//
//   node scripts/ui-probe.mjs --token <token> --out <dir> [--width 1440] [--height 900] [--theme dark]
//
// Prints a JSON summary and exits non-zero on console errors or horizontal overflow.
// Auth state is injected exactly as the panel's store expects (zustand persist v4).

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const token = arg("token", process.env.KUBEK_TOKEN);
const outDir = arg("out", "/tmp/opencode/ui");
const width = Number(arg("width", "1440"));
const height = Number(arg("height", "900"));
const theme = arg("theme", "dark");
const base = arg("base", "http://137.23.58.84:25564");

if (!token) {
  console.error("Missing --token (or KUBEK_TOKEN).");
  process.exit(2);
}

const playwrightCore =
  process.env.PLAYWRIGHT_CORE || "/home/limewater/Games/ROK-BOT/mobile-mcp/node_modules/playwright-core";
const chromePath =
  process.env.CHROME_PATH || path.join(process.env.HOME, ".cache/ms-playwright/chromium-1228/chrome-linux64/chrome");

const { chromium } = require(playwrightCore);

function flattenExtPermissions(profile) {
  const ext = profile?.access?.ext ?? profile?.user?.access?.ext ?? {};
  const keys = [];
  for (const [group, value] of Object.entries(ext)) {
    if (Array.isArray(value)) keys.push(...value.map((entry) => `${group}.${entry}`));
    else if (value && typeof value === "object") {
      for (const inner of Object.values(value)) {
        if (Array.isArray(inner)) keys.push(...inner.map((entry) => `${group}.${entry}`));
        else if (typeof inner === "string") keys.push(`${group}.${inner}`);
      }
    }
  }
  return keys;
}

const response = await fetch(`${base}/api/auth/profile`, {
  headers: { Authorization: `Bearer ${token}` },
});
if (!response.ok) {
  console.error(`Profile request failed: ${response.status} ${response.statusText}`);
  process.exit(2);
}
const payload = await response.json();
const profile = payload?.user ?? payload;
const user = {
  ...profile,
  permissions: [...(profile.permissions ?? []), ...flattenExtPermissions(payload)],
};
const authState = { state: { token, user, isAuthenticated: true }, version: 4 };

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: chromePath });
const context = await browser.newContext({ viewport: { width, height } });
const page = await context.newPage();

const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(String(error)));

await page.addInitScript((state) => {
  localStorage.setItem("auth-storage", JSON.stringify(state));
}, authState);

const result = {
  url: `${base}/ext?view=com.kubek.players/PlayersDashboard`,
  theme,
  width,
  height,
  consoleErrors,
  overflow: null,
  metrics: {},
  screenshot: path.join(outDir, "page.png"),
};

try {
  await page.goto(result.url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".k-page", { timeout: 20000 });
  await page.evaluate((value) => {
    document.documentElement.classList.toggle("dark", value === "dark");
  }, theme);
  await page.waitForTimeout(600);

  result.overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  result.metrics = await page.evaluate(() => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return { width: Math.round(box.width), height: Math.round(box.height) };
    };
    return {
      page: rect(".k-page"),
      header: rect(".k-page-header"),
      strip: rect(".k-strip"),
      tabs: rect(".k-tabs"),
      panel: rect(".k-panel"),
      statColumns: getComputedStyle(document.querySelector(".k-strip")).gridTemplateColumns,
      tabsOverflow: (() => {
        const tabs = document.querySelector(".k-tabs");
        return tabs ? tabs.scrollWidth > tabs.clientWidth + 1 : null;
      })(),
    };
  });

  await page.screenshot({ path: result.screenshot, fullPage: false });
} catch (error) {
  result.consoleErrors.push(`probe: ${String(error)}`);
} finally {
  await browser.close();
}

console.log(JSON.stringify(result, null, 2));

if (result.consoleErrors.length > 0 || result.overflow) process.exit(1);
