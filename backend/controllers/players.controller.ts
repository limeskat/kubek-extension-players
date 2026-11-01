import fs from "node:fs";
import type { ExtRoute } from "@kubekpanel/extension-sdk";
import type { CommandExecutorService } from "../services/command-executor.service";
import type { MinecraftFilesService } from "../services/minecraft-files.service";
import type { NbtParserService } from "../services/nbt-parser.service";
import type { SkinAvatarService } from "../services/skin-avatar.service";
import type { StatsParserService } from "../services/stats-parser.service";
import type {
  PlayerDetails,
  PlayerSummary,
  PurgeDataOptions,
} from "../types";

const SERVER_NOT_RUNNING = "Server is not running. Start it and try again.";
const ACTION_FAILED =
  "The action could not be applied. The server is stopped, or the player has never joined this server.";

export function createPlayersRoutes(
  files: MinecraftFilesService,
  nbtParser: NbtParserService,
  statsParser: StatsParserService,
  executor: CommandExecutorService,
  avatar: SkinAvatarService,
  onlineTracker: Map<string, Set<string>>, // serverId -> Set of online usernames
): ExtRoute[] {
  /**
   * Helper: Resolve username from UUID or fallback to usercache
   */
  const resolvePlayerName = (serverId: string, uuid: string): string => {
    const cache = files.getUserCache(serverId);
    const entry = cache.find((e) => e.uuid.toLowerCase() === uuid.toLowerCase());
    return entry?.name || uuid.slice(0, 8);
  };

  /**
   * Helper: Resolve UUID from username or usercache
   */
  const resolvePlayerUuid = (serverId: string, username: string): string => {
    const cache = files.getUserCache(serverId);
    const entry = cache.find(
      (e) => e.name.toLowerCase() === username.toLowerCase(),
    );
    return entry?.uuid || username;
  };

  return [
    // 1. Get currently online players
    {
      method: "GET",
      path: "/servers/:serverId/online",
      permission: "ext.players.view",
      handler: (req, res) => {
        const { serverId } = req.params;
        const onlineSet = onlineTracker.get(serverId) || new Set<string>();
        const cache = files.getUserCache(serverId);

        const list: PlayerSummary[] = Array.from(onlineSet).map((name) => {
          const cached = cache.find(
            (c) => c.name.toLowerCase() === name.toLowerCase(),
          );
          const uuid = cached?.uuid || name;
          return {
            uuid,
            username: name,
            isOnline: true,
            skinAvatarUrl: avatar.getAvatarUrl(uuid || name),
          };
        });

        res.json({ online: list });
      },
    },

    // 2. Directory of all discovered players (usercache + world files)
    {
      method: "GET",
      path: "/servers/:serverId/directory",
      permission: "ext.players.view",
      handler: (req, res) => {
        const { serverId } = req.params;
        const onlineSet = onlineTracker.get(serverId) || new Set<string>();
        const discovered = files.getAllDiscoveredPlayers(serverId);
        const cache = files.getUserCache(serverId);

        const players: PlayerSummary[] = discovered.map((p) => {
          const cached = cache.find(
            (c) => c.uuid.toLowerCase() === p.uuid.toLowerCase(),
          );
          const username = p.username || cached?.name || p.uuid.slice(0, 8);
          const isOnline = onlineSet.has(username);

          return {
            uuid: p.uuid,
            username,
            isOnline,
            skinAvatarUrl: avatar.getAvatarUrl(p.uuid),
            lastSeen: cached?.expiresOn,
          };
        });

        res.json({ players });
      },
    },

    // 3. Complete Player Details sub-dashboard
    {
      method: "GET",
      path: "/servers/:serverId/players/:uuid",
      permission: "ext.players.view",
      handler: (req, res) => {
        const { serverId, uuid } = req.params;
        const cleanUuid = uuid.toLowerCase();
        const username = resolvePlayerName(serverId, cleanUuid);
        const onlineSet = onlineTracker.get(serverId) || new Set<string>();
        const isOnline = onlineSet.has(username);

        // Read NBT Data
        const datPath = files.findPlayerDataPath(serverId, cleanUuid);
        const nbtData = datPath ? nbtParser.parsePlayerDataFile(datPath) : null;

        // Read Statistics
        const statsPath = files.findPlayerStatsPath(serverId, cleanUuid);
        const statsData = statsParser.parseStatsFile(statsPath ?? "");

        // Read Access Permissions
        const whitelist = files.getWhitelist(serverId);
        const ops = files.getOps(serverId);
        const bans = files.getBannedPlayers(serverId);

        const isWhitelisted = whitelist.some(
          (w) =>
            w.uuid?.toLowerCase() === cleanUuid ||
            w.name.toLowerCase() === username.toLowerCase(),
        );
        const isOp = ops.some(
          (o) =>
            o.uuid?.toLowerCase() === cleanUuid ||
            o.name.toLowerCase() === username.toLowerCase(),
        );
        const isBanned = bans.some(
          (b) =>
            b.uuid?.toLowerCase() === cleanUuid ||
            b.name.toLowerCase() === username.toLowerCase(),
        );

        const dataUpdatedAt =
          datPath && fs.existsSync(datPath)
            ? fs.statSync(datPath).mtime.toISOString()
            : null;

        const details: PlayerDetails = {
          summary: {
            uuid: cleanUuid,
            username,
            isOnline,
            skinAvatarUrl: avatar.getAvatarUrl(cleanUuid),
          },
          gamemode: nbtParser.extractGamemode(nbtData),
          vitals: nbtParser.extractVitals(nbtData),
          permissions: {
            isWhitelisted,
            isOp,
            isBanned,
          },
          location: nbtParser.extractLocation(nbtData),
          lastDeath: nbtParser.extractLastDeath(nbtData),
          inventory: nbtParser.extractInventory(nbtData),
          stats: statsData,
          lastRefreshedText: new Date().toLocaleTimeString(),
          dataUpdatedAt,
        };

        res.json(details);
      },
    },

    // 4. Player Vitals Action (Heal, Feed, Kill, Starve)
    {
      method: "POST",
      path: "/servers/:serverId/players/:uuid/vitals",
      permission: "ext.players.control",
      handler: async (req, res) => {
        const { serverId, uuid } = req.params;
        const body = (req.body as { action?: string }) || {};
        const action = body.action?.toLowerCase();
        const username = resolvePlayerName(serverId, uuid);

        if (action === "heal") {
          const ok = await executor.healPlayer(serverId, username);
          if (!ok) return res.status(409).json({ error: SERVER_NOT_RUNNING });
          return res.json({ success: true, message: `Healed ${username}` });
        }
        if (action === "feed") {
          const ok = await executor.feedPlayer(serverId, username);
          if (!ok) return res.status(409).json({ error: SERVER_NOT_RUNNING });
          return res.json({ success: true, message: `Fed ${username}` });
        }
        if (action === "kill") {
          const ok = await executor.killPlayer(serverId, username);
          if (!ok) return res.status(409).json({ error: SERVER_NOT_RUNNING });
          return res.json({ success: true, message: `Killed ${username}` });
        }
        if (action === "starve") {
          const ok = await executor.starvePlayer(serverId, username);
          if (!ok) return res.status(409).json({ error: SERVER_NOT_RUNNING });
          return res.json({ success: true, message: `Starved ${username}` });
        }

        res.status(400).json({ error: `Unknown vitals action: ${action}` });
      },
    },

    // 5. Change Player Gamemode
    {
      method: "POST",
      path: "/servers/:serverId/players/:uuid/gamemode",
      permission: "ext.players.control",
      handler: async (req, res) => {
        const { serverId, uuid } = req.params;
        const body = (req.body as { gamemode?: string }) || {};
        const gamemode = body.gamemode;
        if (!gamemode) {
          return res.status(400).json({ error: "Missing gamemode in request body" });
        }
        const username = resolvePlayerName(serverId, uuid);
        const ok = await executor.setGamemode(serverId, username, gamemode);
        if (!ok) return res.status(409).json({ error: SERVER_NOT_RUNNING });
        res.json({ success: true, message: `Updated gamemode of ${username} to ${gamemode}` });
      },
    },

    // 6. Kick Player
    {
      method: "POST",
      path: "/servers/:serverId/players/:uuid/kick",
      permission: "ext.players.control",
      handler: async (req, res) => {
        const { serverId, uuid } = req.params;
        const body = (req.body as { reason?: string }) || {};
        const reason = body.reason || "Kicked by administrator";
        const username = resolvePlayerName(serverId, uuid);
        const ok = await executor.kickPlayer(serverId, username, reason);
        if (!ok) return res.status(409).json({ error: SERVER_NOT_RUNNING });
        res.json({ success: true, message: `Kicked player ${username}` });
      },
    },

    // 7. Teleport Player
    {
      method: "POST",
      path: "/servers/:serverId/players/:uuid/teleport",
      permission: "ext.players.control",
      handler: async (req, res) => {
        const { serverId, uuid } = req.params;
        const body = (req.body || {}) as { world?: string; x?: number; y?: number; z?: number };
        const x = Number(body.x);
        const y = Number(body.y);
        const z = Number(body.z);
        if (![x, y, z].every(Number.isFinite)) {
          return res.status(400).json({ error: "Missing or invalid x, y, or z coordinates" });
        }
        const world = body.world || "minecraft:overworld";
        if (!/^[A-Za-z0-9_.:-]+$/.test(world)) {
          return res.status(400).json({ error: "Invalid dimension name" });
        }

        const cleanUuid = uuid.toLowerCase();
        const username = resolvePlayerName(serverId, cleanUuid);
        const online = Array.from(onlineTracker.get(serverId) || []).some(
          (name) => name.toLowerCase() === username.toLowerCase(),
        );

        // Online: Minecraft has an entity, use the console command.
        if (online) {
          const ok = await executor.teleportPlayer(serverId, username, { world, x, y, z });
          if (!ok) return res.status(409).json({ error: SERVER_NOT_RUNNING });
          return res.json({
            success: true,
            method: "command",
            message: `Teleported ${username} to ${x}, ${y}, ${z}`,
          });
        }

        // Offline: there is no entity. Write the position into the player data file so
        // Minecraft applies it on the next join.
        const datPath = files.findPlayerDataPath(serverId, cleanUuid);
        if (!datPath) {
          return res.status(404).json({
            error: `No player data file found for ${username}. They need to join the server once before this works.`,
          });
        }

        try {
          nbtParser.writePlayerTeleport(datPath, { world, x, y, z });
        } catch (error) {
          return res.status(500).json({
            error:
              error instanceof Error
                ? error.message
                : "Could not write the player data file",
          });
        }

        return res.json({
          success: true,
          method: "player-data",
          message: `Saved ${username}'s new position (${x}, ${y}, ${z}). It will apply the next time they join.`,
        });
      },
    },

    // 8. Toggle Permission Switch (Whitelisted, Operator, Banned)
    {
      method: "POST",
      path: "/servers/:serverId/players/:uuid/permissions",
      permission: "ext.players.manage_access",
      handler: async (req, res) => {
        const { serverId, uuid } = req.params;
        const body = (req.body as { perm?: string; value?: boolean }) || {};
        const { perm, value } = body;
        const username = resolvePlayerName(serverId, uuid);

        if (perm === "whitelist" || perm === "whitelisted") {
          const ok = value
            ? await executor.addToWhitelist(serverId, username)
            : await executor.removeFromWhitelist(serverId, username);
          if (!ok) return res.status(409).json({ error: ACTION_FAILED });
          return res.json({ success: true, perm, value });
        }

        if (perm === "op" || perm === "operator") {
          const ok = value
            ? await executor.opPlayer(serverId, username)
            : await executor.deopPlayer(serverId, username);
          if (!ok) return res.status(409).json({ error: ACTION_FAILED });
          return res.json({ success: true, perm, value });
        }

        if (perm === "ban" || perm === "banned") {
          const ok = value
            ? await executor.banPlayer(serverId, username)
            : await executor.unbanPlayer(serverId, username);
          if (!ok) return res.status(409).json({ error: ACTION_FAILED });
          return res.json({ success: true, perm, value });
        }

        res.status(400).json({ error: `Unknown permission: ${perm}` });
      },
    },

    // 9. Selective Player Data Purge
    {
      method: "POST",
      path: "/servers/:serverId/players/:uuid/purge",
      permission: "ext.players.purge",
      handler: async (req, res) => {
        const { serverId, uuid } = req.params;
        const cleanUuid = uuid.toLowerCase();
        const options = (req.body as PurgeDataOptions) || {};
        const username = resolvePlayerName(serverId, cleanUuid);
        const online = Array.from(onlineTracker.get(serverId) || []).some(
          (name) => name.toLowerCase() === username.toLowerCase(),
        );

        // The running server keeps the player's data in memory and rewrites it on save, so
        // deleting the files of an online player would either do nothing or corrupt the save.
        if (online) {
          return res.status(409).json({
            error: `Cannot purge data while ${username} is online. Ask them to disconnect first.`,
          });
        }

        const targets: string[] = [];
        if (options.playerDataFile) {
          const p = files.findPlayerDataPath(serverId, cleanUuid);
          if (p) targets.push(p);
        }
        if (options.statisticsFile) {
          const p = files.findPlayerStatsPath(serverId, cleanUuid);
          if (p) targets.push(p);
        }
        if (options.advancementsFile) {
          const p = files.findPlayerAdvancementsPath(serverId, cleanUuid);
          if (p) targets.push(p);
        }

        if (targets.length === 0) {
          return res.status(404).json({
            error: "No matching player data files were found. Nothing was deleted.",
          });
        }

        const deleted: string[] = [];
        for (const target of targets) {
          try {
            fs.unlinkSync(target);
            deleted.push(target);
          } catch {
            // keep deleting the other selected files
          }
        }

        if (deleted.length === 0) {
          return res.status(500).json({
            error: "The selected files could not be deleted. Check panel filesystem permissions.",
          });
        }

        res.json({
          success: true,
          deleted,
          message: `Purged ${deleted.length} file(s) for ${cleanUuid}`,
        });
      },
    },

    // 10. Delete a player entirely: data files, backups and the usercache entry
    {
      method: "DELETE",
      path: "/servers/:serverId/players/:uuid",
      permission: "ext.players.purge",
      handler: async (req, res) => {
        const { serverId, uuid } = req.params;
        const cleanUuid = uuid.toLowerCase();
        const username = resolvePlayerName(serverId, cleanUuid);
        const online = Array.from(onlineTracker.get(serverId) || []).some(
          (name) => name.toLowerCase() === username.toLowerCase(),
        );

        // Same reason as purge: the running server rewrites these files on save
        if (online) {
          return res.status(409).json({
            error: `Cannot delete ${username} while they are online. Ask them to disconnect first.`,
          });
        }

        const dataPath = files.findPlayerDataPath(serverId, cleanUuid);
        const targets = [
          dataPath,
          dataPath ? `${dataPath}_old` : null,
          files.findPlayerStatsPath(serverId, cleanUuid),
          files.findPlayerAdvancementsPath(serverId, cleanUuid),
        ].filter((target): target is string => Boolean(target && fs.existsSync(target)));

        const deleted: string[] = [];
        for (const target of targets) {
          try {
            fs.unlinkSync(target);
            deleted.push(target);
          } catch {
            // keep deleting the other files
          }
        }

        const removedFromCache = files.removeUserCacheEntry(serverId, cleanUuid, username);

        if (deleted.length === 0 && removedFromCache === 0) {
          return res.status(404).json({ error: `No player data found for ${username}.` });
        }

        res.json({
          success: true,
          deleted,
          removedFromCache,
          message: `Deleted ${username}: ${deleted.length} file(s), ${removedFromCache} cache entr${removedFromCache === 1 ? "y" : "ies"} removed`,
        });
      },
    },
  ];
}
