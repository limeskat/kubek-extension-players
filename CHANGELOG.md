# Changelog

All notable changes to the Kubek Players Management extension are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project uses [Semantic Versioning](https://semver.org/).

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
