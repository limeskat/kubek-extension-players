# Changelog

All notable changes to the Kubek Players Management extension are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project uses [Semantic Versioning](https://semver.org/).

## [1.2.0] - 2026-11-01

### Added

- **Delete player**: removes the player's `.dat` and its `.dat_old` backup, statistics and
  advancements files, and their `usercache.json` entry, so the player disappears from the panel
  and rejoins as a brand-new player. Whitelist, OP and ban entries are left alone. Refused while
  the player is online, and confirmed in its own dialog.
- `DELETE /servers/:serverId/players/:uuid` (permission `ext.players.purge`).

## [1.1.0] - 2026-11-01

### Changed

- The page now uses Kubek's own layout grammar: page header, stat strip, segmented tabs and
  bordered list panels instead of the custom cards, tables and popups.
- Whitelist, operators, banned players and banned IPs are managed inline in their tab; the
  four list modals are gone.
- Player details is a sectioned dialog built from the panel's dialog anatomy (header, scrolling
  body, footer) with separate panels for vitals, inventory, position, last death, statistics,
  access and the danger zone.
- Buttons, inputs and badges come from `window.Kubek.ui`; every colour reads a panel CSS
  variable, so light and dark themes both render correctly.
- Player heads are loaded from the panel's public `/api/heads/{name}` endpoint, with a locally
  generated face when a name has no skin.
- Success and error feedback is a non-blocking toast; `alert()` was removed.

### Added

- Inventory view switch: native slots (default) or the classic Minecraft bevel, remembered per
  browser in `localStorage`.
- Game mode selector in the access section.

### Fixed

- The player dialog now traps keyboard focus, and Escape closes only the topmost dialog.
- Filtering an access list to zero rows reports "No matches" instead of claiming the list is
  empty.
- Custom selects render their option lists with the panel's popover colours, so the open list
  is readable in both themes.
- Inventory slots scale 40 → 34 → 24px and the classic frame shrinks with them, so nothing is
  clipped or scrolled on phones.
- Panel-header switches (Native/Classic, Inventory/Ender chest, Players/IPs) use a compact
  26px variant that fits inside the 44px header.

### Removed

- `CategoryCards`, `CategoryListModal`, `OnlinePlayersList`, `OfflinePlayersList`,
  `PlayerDetailsModal`, `PurgeConfirmModal` and the legacy `.mc-*` stylesheet.

## [1.0.2] - 2026-11-01

### Added

- Offline-player teleport: writes `Pos`, `Dimension`, `Motion`, `FallDistance`,
  `PortalCooldown` and `OnGround` into the player's `.dat` file and applies the new
  position on their next join. A `<uuid>.dat.teleport-backup` is kept on first use.
- Last-death location (coordinates + dimension) in the player details modal.
- Full inventory view for modern worlds: hotbar/main slots, armor, offhand, ender chest,
  item counts and item images.
- Online-player recovery from `logs/latest.log`, so the online list is correct after a
  panel or extension reload.
- Unit tests for world resolution, NBT parsing/writing, offline teleport and the
  extension entry contract.

### Fixed

- World data was hardcoded to `world/`. The extension now reads `level-name` from
  `server.properties`, supports `<world>/players/data` (1.21.9+) and
  `<world>/playerdata`, and picks the newest data across multiworld folders.
- Stats and advancements now load from `<world>/players/stats` and
  `<world>/players/advancements`.
- Player details no longer fall back to `0 / 64 / 0`, `20/20 HP`, an empty inventory and
  `No data` when the server uses a non-default world folder.
- Modern item tags (`count`, `equipment`) are parsed; armor and item counts no longer
  display as empty or `1`.
- Commands now return `409` when the server is stopped or a command cannot be delivered,
  instead of reporting success.
- Purging is blocked while the target player is online; unsupported purge categories were
  removed from the UI.
- Avatars default to `mc-heads` and all image fallbacks use it; `crafatar` frequently
  returned HTTP 500.

### Changed

- Player details UI compacted: 1040 px max width, scrollable body, 44 px inventory slots
  (responsive down to 30 px), 3-column coordinate boxes, and smaller list/teleport/purge
  modals.
- Teleporting an offline player is exposed as **Save position** with an explanatory note.
- Version bumped to `1.0.2`.
