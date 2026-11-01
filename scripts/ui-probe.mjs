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
const bundle = arg("bundle", "");
const localesDir = arg("locales", "");
const openDialog = args.includes("--dialog");
const tabName = arg("tab", "");
const classic = args.includes("--classic");
const teleport = args.includes("--teleport");

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
const networkErrors = [];
page.on("console", (message) => {
  // Asset 404s are reported by the network listener below with their URL.
  if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) {
    consoleErrors.push(message.text());
  }
});
page.on("pageerror", (error) => consoleErrors.push(String(error)));
page.on("response", (response) => {
  const url = response.url();
  // The panel's head endpoint 404s for names without a skin; the UI draws a face instead.
  if (response.status() >= 400 && !url.includes("/api/heads/")) {
    networkErrors.push(`${response.status()} ${url}`);
  }
});

await page.addInitScript((state) => {
  localStorage.setItem("auth-storage", JSON.stringify(state));
}, authState);

// Serve the local locale dictionaries so new keys resolve before deploy.
if (localesDir) {
  const readLocale = (name) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(path.resolve(localesDir), name), "utf8"));
    } catch {
      return undefined;
    }
  };
  const dictionaries = {
    en: readLocale("en.json"),
    ru: readLocale("ru.json"),
    us: readLocale("us.json"),
  };
  await page.route("**/api/extensions/registry*", async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    const list = Array.isArray(body) ? body : body.extensions || [];
    for (const item of list) {
      if (item.id === "com.kubek.players") item.locales = dictionaries;
    }
    await route.fulfill({ response, json: body });
  });
}

// Serve a local build for this extension instead of the deployed one.
if (bundle) {
  const absolute = path.resolve(bundle);
  await page.route("**/api/extensions/*/assets/frontend/dist/index.js*", (route) =>
    route.fulfill({ path: absolute, contentType: "text/javascript" }),
  );
}

const result = {
  url: `${base}/ext?view=com.kubek.players/PlayersDashboard`,
  theme,
  width,
  height,
  consoleErrors,
  networkErrors,
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
  if (tabName) {
    const tab = page.getByRole("tab", { name: new RegExp(tabName, "i") }).first();
    if (await tab.count()) {
      await tab.click();
      await page.waitForTimeout(600);
    }
  }

  await page.waitForTimeout(600);

  result.overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  if (openDialog) {
    const row = page.locator(".k-row").first();
    if (await row.count()) {
      await row.click();
      await page.waitForSelector(".k-dialog", { timeout: 10000 });
      await page.waitForTimeout(700);
      result.dialog = await page.evaluate(() => {
        const dialog = document.querySelector(".k-dialog");
        const body = document.querySelector(".k-dialog-body");
        const box = dialog?.getBoundingClientRect();
        return {
          box: box && { width: Math.round(box.width), height: Math.round(box.height), top: Math.round(box.top) },
          viewport: { width: window.innerWidth, height: window.innerHeight },
          bodyScrolls: body ? body.scrollHeight > body.clientHeight + 1 : null,
          bodyWidth: body ? Math.round(body.clientWidth) : null,
          sections: document.querySelectorAll(".k-dialog-body .k-panel").length,
          slotWidth: (() => {
            const slot = document.querySelector(".k-slot");
            return slot ? Math.round(slot.getBoundingClientRect().width) : null;
          })(),
          slotVar: (() => {
            const scroll = document.querySelector(".k-inv-scroll");
            return scroll ? getComputedStyle(scroll).getPropertyValue("--k-slot-size").trim() : null;
          })(),
          invOverflow: (() => {
            const scroll = document.querySelector(".k-inv-scroll");
            return scroll ? scroll.scrollWidth > scroll.clientWidth + 1 : null;
          })(),
        };
      });
      await page.screenshot({ path: path.join(outDir, "dialog.png"), fullPage: false });

      // Focus trap: tabbing all the way round must never leave the dialog.
      const focusEscape = [];
      for (let step = 0; step < 30; step += 1) {
        await page.keyboard.press("Tab");
        const inside = await page.evaluate(() => {
          const dialog = document.querySelector(".k-dialog");
          return dialog ? dialog.contains(document.activeElement) : false;
        });
        if (!inside) focusEscape.push(step);
      }
      for (let step = 0; step < 10; step += 1) {
        await page.keyboard.press("Shift+Tab");
        const inside = await page.evaluate(() => {
          const dialog = document.querySelector(".k-dialog");
          return dialog ? dialog.contains(document.activeElement) : false;
        });
        if (!inside) focusEscape.push(`shift-${step}`);
      }
      result.focusTrap = { escapedAt: focusEscape };
      await page.evaluate(() => document.querySelector(".k-dialog")?.scrollTo?.(0, 0));

      if (teleport) {
        const button = page.getByRole("button", { name: /Teleport|Save position/i }).first();
        if (await button.count()) {
          await button.click();
          await page.waitForTimeout(600);
          const dialogs = page.locator(".k-dialog");
          const count = await dialogs.count();
          if (count > 1) {
            result.teleportBox = await dialogs.last().evaluate((el) => {
              const box = el.getBoundingClientRect();
              return { width: Math.round(box.width), height: Math.round(box.height) };
            });
            await page.screenshot({ path: path.join(outDir, "teleport.png"), fullPage: false });
            // Escape must close only the topmost dialog.
            await page.keyboard.press("Escape");
            await page.waitForTimeout(300);
            result.escapeClosesTopOnly = (await page.locator(".k-dialog").count()) === 1;
          }
        }
      }

      if (classic) {
        const mode = page.getByRole("tab", { name: /^Classic$/ }).first();
        if (await mode.count()) {
          await mode.click();
          await page.waitForTimeout(500);
          await page.screenshot({ path: path.join(outDir, "dialog-classic.png"), fullPage: false });
          result.classic = await page.evaluate(() => {
            const scroll = document.querySelector(".k-inv-scroll");
            const slot = document.querySelector(".k-slot");
            const count = document.querySelector(".k-slot-count");
            return {
              hasClass: Boolean(document.querySelector(".k-inv--classic")),
              canvas: scroll ? getComputedStyle(scroll).backgroundColor : null,
              slot: slot ? getComputedStyle(slot).backgroundColor : null,
              countColor: count ? getComputedStyle(count).color : null,
            };
          });
        }
      }
    } else {
      result.dialog = { error: "no rows on the page" };
    }
  }

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

if (result.consoleErrors.length > 0 || result.networkErrors.length > 0 || result.overflow) process.exit(1);
