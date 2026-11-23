# Kubek Players Management Extension

[![GitHub Release](https://img.shields.io/github/v/release/limeskat/kubek-extension-players?logo=github)](https://github.com/limeskat/kubek-extension-players/releases)
[![Kubek Panel](https://img.shields.io/badge/Kubek%20Panel-%E2%89%A5%20v4.0.0-F16436.svg)](https://github.com/KubekPanel)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-%E2%89%A5%201.2-000000.svg?logo=bun)](https://bun.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A player management extension for the [Kubek Minecraft Server Panel](https://github.com/KubekPanel) that follows the panel's own interface: same page header, stat strip, segmented tabs, list panels and dialog anatomy, in both light and dark themes. It adds what the native Players page does not cover — offline players, vitals, inventory, teleport and data purge.

## Features

- **Access Control**: Whitelist, Operators (OPs), Banned Players, and Banned IPs live in their own tabs with search, avatars and inline add/remove — no popups.
- **Live Telemetry**: Real-time tracking of online players, vitals (Health, Hunger, XP, Gamemode), coordinates, dimension, last-death location, and full inventory (armor column, offhand, hotbar, main slots and ender chest).
- **Player Dialog**: Vitals, inventory, position, last death, statistics, access switches and a danger zone as separate panels in one sectioned dialog.
- **Player Actions**: Heal, Feed, Kill, Starve, Kick, Gamemode switcher and Teleport. Online players are teleported through the console; offline players get their saved position rewritten and it applies on their next join.
- **Player Data Management**: Inspect offline player records (`usercache.json`, NBT `.dat` files) and safely purge or reset player data.
- **Native UI**: Panel tokens only, `window.Kubek.ui` controls, player heads from the panel's `/api/heads/{name}`, non-blocking toasts instead of `alert()`.
- **Delete Player**: removes every data file and the usercache entry so the player disappears from the panel and rejoins as new; whitelist/OP/ban entries stay. Blocked while the player is online.
- **Inventory Views**: Native slots by default, with an optional classic Minecraft bevel; the choice is remembered per browser. Icons come from a hosted vanilla renderer (blocks, stairs, tools, shield) with a local canvas renderer, flat-texture path and generic glyph as fallbacks for older versions, modded items and offline panels.

## Compatibility & Requirements

- **Kubek Panel**: `v4.0.0` or higher
- **Bun**: `v1.2+` (tests, local build and the panel's install-time frontend build)
- **Node.js**: `v18+` (only the packaging script runs on Node)

## Installation

### Option 1: Install from the catalog

1. Open your Kubek Panel dashboard.
2. Go to **Extensions** → **Catalog**, find **Players Management** and install it.
3. Confirm the requested capabilities, then enable the extension.

### Option 2: Install a package

1. Download the latest `io.github.limeskat.players.kubekext` file from [Releases](releases).
2. Go to **Extensions** → **Install Extension** and upload the file.
3. Confirm the requested capabilities, then enable the extension.

### Option 3: Build from source

1. **Clone the repository**:
   ```bash
   git clone https://github.com/limeskat/kubek-extension-players.git
   cd kubek-extension-players
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Typecheck, test and build**:
   ```bash
   bun run typecheck
   bun test
   bun run build
   ```

4. **Package the extension**:
   ```bash
   bun run package
   ```

   This generates `io.github.limeskat.players.kubekext` in the root directory.

5. Install the package into your Kubek panel via the web UI or by copying it to the `extensions/` directory.

### Upgrading from 1.5.x

The extension moved from the reserved `com.kubek.players` id to `io.github.limeskat.players` so it can
be listed in the community catalog. The panel treats it as a new extension: remove the old one first.
Its settings and stored state are not migrated.

## Development

```bash
bun install
bun test          # backend parsers, pure helpers, UI kit and tab logic
bun run typecheck
bun run build     # frontend/dist/index.js for the UI probe; the panel also builds this on install
bun run package   # io.github.limeskat.players.kubekext
```

The backend entry (`backend/index.ts`) runs directly on Bun, and the frontend entry
(`frontend/src/index.ts`) is built by the panel at install time. Sources are always in the package;
nothing is minified-only.

### Visual check

`scripts/ui-probe.mjs` drives a live panel with Chromium and reports console errors, failed requests, page overflow and dialog metrics (size, scrolling, slot size, focus trap):

```bash
node scripts/ui-probe.mjs --token "$KUBEK_TOKEN" --out /tmp/ui \
  --tab "All players" --dialog --width 1440 --height 900 --theme dark
```

Add `--bundle frontend/dist/index.js --locales locales` to exercise a local build before deploying; without them the probe uses what the panel is serving. The URL and theme are configurable with `--base`, `--theme light`, and `--classic` for the classic inventory view.

## Permissions

The extension declares four panel permissions:

| Key | Description |
| --- | --- |
| `ext.players.view` | View players, access lists, and statistics |
| `ext.players.control` | Execute player actions (kick, heal, feed, teleport, etc.) |
| `ext.players.manage_access` | Modify Whitelist, OPs, Bans, and IP Bans |
| `ext.players.purge` | Purge and reset player data files |

It requests these panel capabilities:

| Capability | Why |
| --- | --- |
| `servers:read` | Read server status and the server list |
| `servers:control` | Run player actions (kick, gamemode, teleport, heal, lists) through the console |
| `http:routes` | Serve the extension's REST endpoints under `/api/ext/io.github.limeskat.players` |
| `http:outbound` | Resolve player names through the Mojang API on online-mode servers |
| `settings` | Read the configured avatar provider |
| `events:server` | Track server start/stop/crash to keep the online list accurate |
| `events:players` | Track joins and leaves |
| `events:logs` | Recover the online list from `logs/latest.log` |

## Network access

- **Panel → Mojang** (`api.mojang.com`): only for online-mode servers, to resolve a typed name to its
  canonical spelling and UUID. Offline-mode servers never call it.
- **Browser → avatar providers**: player heads come from the provider selected in the extension
  settings (`mc-heads` by default); the player name or UUID is part of the image URL.
- **Browser → item asset hosts**: vanilla item icons from `api.minecraftitems.xyz` and versioned
  textures from jsDelivr. Modded items and offline panels fall back to a local renderer.
- **Browser → panel**: heads and the REST API stay on the panel's own `/api` routes.

No telemetry, logs, settings or user data are sent anywhere else.

## Known limits

- Teleporting an offline player rewrites their saved NBT; it applies on their next join.
- Servers that store dimensions as numeric ids cannot teleport a player into a custom dimension.
- The online list follows the server log tail (join/leave messages, `logged in with entity id`,
  `lost connection`). A server that hides all of those lines may lag until the next event.
- Inventory rendering covers vanilla layouts; modded items keep a text/glyph fallback.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full release notes.

## License

This project is licensed under the [MIT License](LICENSE).
