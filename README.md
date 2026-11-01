# Kubek Players Management Extension

[![GitHub Release](https://img.shields.io/github/v/release/limeskat/kubek-extension-players?logo=github)](https://github.com/limeskat/kubek-extension-players/releases)
[![Kubek Panel](https://img.shields.io/badge/Kubek%20Panel-%E2%89%A5%20v4.0.0-F16436.svg)](https://github.com/KubekPanel)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A5%2018-339933.svg?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
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
- **Inventory Views**: Native slots by default, with an optional classic Minecraft bevel; the choice is remembered per browser. Icons are resolved from the game's item models for the server's exact version, so armour, saplings and new items render correctly; modded items get a neutral glyph.

## Compatibility & Requirements

- **Kubek Panel**: `v4.0.0` or higher
- **Node.js**: `v18+` or `v22+` (for building from source)

## Installation

### Option 1: Install Pre-built Extension (Recommended)
1. Download the latest `com.kubek.players.kubekext` file from [Releases](releases).
2. Open your Kubek Panel dashboard.
3. Navigate to **Extensions** → **Install Extension** and upload the `.kubekext` file (or place it in your Kubek `extensions/` directory).
4. Restart or reload the panel.

### Option 2: Build from Source

1. **Clone the repository**:
   ```bash
   git clone https://github.com/limeskat/kubek-extension-players.git
   cd kubek-extension-players
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Typecheck & Build**:
   ```bash
   npm run typecheck
   npm run build
   ```

4. **Package extension**:
   ```bash
   npm run package
   ```

   This generates `com.kubek.players.kubekext` in the root directory.

5. Install `com.kubek.players.kubekext` into your Kubek panel via the web UI or by copying it to the `extensions/` directory.

## Development

```bash
npm test          # Bun: backend parsers, pure helpers, UI kit and tab logic
npm run typecheck
npm run build     # frontend/dist/index.js, frontend/index.ts, backend/entry.js
npm run package   # com.kubek.players.kubekext
```

### Visual check

`scripts/ui-probe.mjs` drives a live panel with Chromium and reports console errors, failed requests, page overflow and dialog metrics (size, scrolling, slot size, focus trap):

```bash
node scripts/ui-probe.mjs --token "$KUBEK_TOKEN" --out /tmp/ui \
  --tab "All players" --dialog --width 1440 --height 900 --theme dark
```

Add `--bundle frontend/dist/index.js --locales locales` to exercise a local build before deploying; without them the probe uses what the panel is serving. The URL and theme are configurable with `--base`, `--theme light`, and `--classic` for the classic inventory view.

## Permissions

| Key | Description |
| --- | --- |
| `ext.players.view` | View players, access lists, and statistics |
| `ext.players.control` | Execute player actions (kick, heal, feed, teleport, etc.) |
| `ext.players.manage_access` | Modify Whitelist, OPs, Bans, and IP Bans |
| `ext.players.purge` | Purge and reset player data files |

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full release notes.

## License

This project is licensed under the [MIT License](LICENSE).
