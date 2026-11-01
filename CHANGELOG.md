# Changelog

All notable changes to the Kubek Players Management extension are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project uses [Semantic Versioning](https://semver.org/).

## [1.5.0] - 2026-11-02

### Changed

- Item icons now come from the hosted vanilla renderer (`api.minecraftitems.xyz`) for vanilla
  items on 1.21.4 and newer, which matches the in-game GUI for blocks, stairs, tools and the
  shield. Icons are preloaded once and then served from the browser cache.
- The local model renderer, flat-texture resolution and generic glyph remain as fallbacks, so
  modded items, older versions and offline panels still render. `USE_REMOTE_ICONS` in
  `item-icons.ts` disables the hosted path.

## [1.4.0] - 2026-11-02

### Added

- Isometric icon renderer for models with geometry: blocks, logs, stairs, slabs, fences,
  crafting tables and other element models keep their 3D inventory look instead of a flat face.
  Faces are projected orthographically, texture-mapped per face, shaded like the vanilla GUI and
  depth-sorted; grass and leaves get their biome tint.
- Shields render from the wood texture clipped to the shield silhouette, so the slot no longer
  falls back to a generic glyph.

### Changed

- Icon resolution now picks rendered geometry, then the flat model texture, then the generic
  glyph. Rendered icons are cached per game version and item id.

## [1.3.0] - 2026-11-02

### Changed

- Inventory icons are resolved from the game's own item definitions instead of guessing
  `item/` and `block/` paths: `assets/minecraft/items/<id>.json` → model → `textures.layer0`,
  following parent chains, `select` models (trimmed armour) and `condition` models. This fixes
  items whose texture lives in the other folder (e.g. `oak_sapling`) and armour in modern
  versions.
- Assets are fetched per game version (`@26.2` from the server's `GAME_VERSION`) through
  jsDelivr, and resolved URLs are cached per version and item id.
- Slots show a shimmer while resolving and a neutral item glyph when no vanilla texture exists
  (modded namespaces, special-rendered items such as the shield).

## [1.2.1] - 2026-11-01

### Fixed

- Deleting a player no longer removes `usercache.json` entries of other accounts that share
  the same name with a different UUID. Cache entries are matched by UUID only.
- Deleting a player now removes their files from **every** world and both layouts
  (`players/data` and `playerdata`, stats, advancements, `.dat_old`), instead of only the most
  recently written world. A leftover copy no longer survives in another world.

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
