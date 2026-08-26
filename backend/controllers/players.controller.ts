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
        const statsData = statsPath
          ? statsParser.parseStatsFile(statsPath)
          : statsParser.parseStatsFile("");

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
          inventory: nbtParser.extractInventory(nbtData),
          stats: statsData,
          lastRefreshedText: new Date().toLocaleTimeString(),
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
          await executor.healPlayer(serverId, username);
          return res.json({ success: true, message: `Healed ${username}` });
        }
        if (action === "feed") {
          await executor.feedPlayer(serverId, username);
          return res.json({ success: true, message: `Fed ${username}` });
        }
        if (action === "kill") {
          await executor.killPlayer(serverId, username);
          return res.json({ success: true, message: `Killed ${username}` });
        }
        if (action === "starve") {
          await executor.starvePlayer(serverId, username);
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
        await executor.setGamemode(serverId, username, gamemode);
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
        await executor.kickPlayer(serverId, username, reason);
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
        if (body.x === undefined || body.y === undefined || body.z === undefined) {
          return res.status(400).json({ error: "Missing x, y, or z coordinates" });
        }
        const username = resolvePlayerName(serverId, uuid);
        await executor.teleportPlayer(serverId, username, {
          world: body.world || "minecraft:overworld",
          x: body.x,
          y: body.y,
          z: body.z,
        });
        res.json({ success: true, message: `Teleported ${username} to ${body.x}, ${body.y}, ${body.z}` });
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
          if (value) await executor.addToWhitelist(serverId, username);
          else await executor.removeFromWhitelist(serverId, username);
          return res.json({ success: true, perm, value });
        }

        if (perm === "op" || perm === "operator") {
          if (value) await executor.opPlayer(serverId, username);
          else await executor.deopPlayer(serverId, username);
          return res.json({ success: true, perm, value });
        }

        if (perm === "ban" || perm === "banned") {
          if (value) await executor.banPlayer(serverId, username);
          else await executor.unbanPlayer(serverId, username);
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

        // 1. Player Data File (.dat)
        if (options.playerDataFile) {
          const datPath = files.findPlayerDataPath(serverId, cleanUuid);
          if (datPath && fs.existsSync(datPath)) {
            try {
              fs.unlinkSync(datPath);
            } catch {}
          }
          const datOldPath = `${datPath}_old`;
          if (fs.existsSync(datOldPath)) {
            try {
              fs.unlinkSync(datOldPath);
            } catch {}
          }
        }

        // 2. Statistics File (.json)
        if (options.statisticsFile) {
          const statsPath = files.findPlayerStatsPath(serverId, cleanUuid);
          if (statsPath && fs.existsSync(statsPath)) {
            try {
              fs.unlinkSync(statsPath);
            } catch {}
          }
        }

        // 3. Advancements File (.json)
        if (options.advancementsFile) {
          const advPath = files.findPlayerAdvancementsPath(serverId, cleanUuid);
          if (advPath && fs.existsSync(advPath)) {
            try {
              fs.unlinkSync(advPath);
            } catch {}
          }
        }

        res.json({ success: true, message: `Purged selected player data for ${cleanUuid}` });
      },
    },
  ];
}
