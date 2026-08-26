# Kubek Players Management Extension

[![GitHub Release](https://img.shields.io/github/v/release/limeskat/kubek-extension-players?logo=github)](https://github.com/limeskat/kubek-extension-players/releases)
[![Kubek Panel](https://img.shields.io/badge/Kubek%20Panel-%E2%89%A5%20v4.0.0-F16436.svg)](https://github.com/KubekPanel)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A5%2018-339933.svg?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An Aternos-style player management dashboard extension for the [Kubek Minecraft Server Panel](https://github.com/KubekPanel).

## Features

- **Access Control**: Manage Whitelist, Operators (OPs), Banned Players, and Banned IPs with instant search and avatar previews.
- **Live Telemetry**: Real-time tracking of online players, vitals (Health, Hunger, XP, Gamemode), coordinates, and dimension.
- **Player Actions**: In-game player controls (Heal, Feed, Kill, Starve, Kick, Gamemode switcher, Teleport modal).
- **Player Data Management**: Inspect offline player records (`usercache.json`, NBT `.dat` files) and safely purge or reset player data.

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

## Permissions

| Key | Description |
| --- | --- |
| `ext.players.view` | View players, access lists, and statistics |
| `ext.players.control` | Execute player actions (kick, heal, feed, teleport, etc.) |
| `ext.players.manage_access` | Modify Whitelist, OPs, Bans, and IP Bans |
| `ext.players.purge` | Purge and reset player data files |

## License

This project is licensed under the [MIT License](LICENSE).
