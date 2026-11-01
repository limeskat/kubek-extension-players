import type { ExtRoute } from "@kubekpanel/extension-sdk";
import type { CommandExecutorService } from "../services/command-executor.service";
import type { MinecraftFilesService } from "../services/minecraft-files.service";
import type { SkinAvatarService } from "../services/skin-avatar.service";

const ACTION_FAILED =
  "The change could not be applied. The server is stopped and the player is unknown (they must join once), or the console command failed.";

export function createListsRoutes(
  files: MinecraftFilesService,
  executor: CommandExecutorService,
  avatar: SkinAvatarService,
): ExtRoute[] {
  return [
    // 1. Summary counts for category cards
    {
      method: "GET",
      path: "/servers/:serverId/summary",
      permission: "ext.players.view",
      handler: (req, res) => {
        const { serverId } = req.params;
        const whitelist = files.getWhitelist(serverId);
        const ops = files.getOps(serverId);
        const bannedPlayers = files.getBannedPlayers(serverId);
        const bannedIps = files.getBannedIps(serverId);
        const allDiscovered = files.getAllDiscoveredPlayers(serverId);

        res.json({
          whitelistCount: whitelist.length,
          opsCount: ops.length,
          bannedPlayersCount: bannedPlayers.length,
          bannedIpsCount: bannedIps.length,
          totalPlayersCount: allDiscovered.length,
        });
      },
    },

    // 2. Fetch specific list entries
    {
      method: "GET",
      path: "/servers/:serverId/lists/:type",
      permission: "ext.players.view",
      handler: (req, res) => {
        const { serverId, type } = req.params;

        if (type === "whitelist") {
          const list = files.getWhitelist(serverId).map((entry) => ({
            ...entry,
            avatarUrl: avatar.getAvatarUrl(entry.uuid || entry.name),
          }));
          return res.json({ type, entries: list });
        }

        if (type === "ops") {
          const list = files.getOps(serverId).map((entry) => ({
            ...entry,
            avatarUrl: avatar.getAvatarUrl(entry.uuid || entry.name),
          }));
          return res.json({ type, entries: list });
        }

        if (type === "banned-players" || type === "banned_players") {
          const list = files.getBannedPlayers(serverId).map((entry) => ({
            ...entry,
            avatarUrl: avatar.getAvatarUrl(entry.uuid || entry.name),
          }));
          return res.json({ type: "banned-players", entries: list });
        }

        if (type === "banned-ips" || type === "banned_ips") {
          const list = files.getBannedIps(serverId);
          return res.json({ type: "banned-ips", entries: list });
        }

        res.status(400).json({ error: `Unknown list type: ${type}` });
      },
    },

    // 3. Add to list
    {
      method: "POST",
      path: "/servers/:serverId/lists/:type",
      permission: "ext.players.manage_access",
      handler: async (req, res) => {
        const { serverId, type } = req.params;
        const body = (req.body as Record<string, string>) || {};
        const identifier = body.name || body.username || body.ip || body.identifier;

        if (!identifier || typeof identifier !== "string") {
          return res.status(400).json({ error: "Missing name or ip in request body" });
        }

        if (type === "whitelist") {
          const ok = await executor.addToWhitelist(serverId, identifier.trim());
          if (!ok) return res.status(409).json({ error: ACTION_FAILED });
          return res.json({ success: true, message: `Added ${identifier} to whitelist` });
        }

        if (type === "ops") {
          const ok = await executor.opPlayer(serverId, identifier.trim());
          if (!ok) return res.status(409).json({ error: ACTION_FAILED });
          return res.json({ success: true, message: `Granted OP to ${identifier}` });
        }

        if (type === "banned-players" || type === "banned_players") {
          const reason = body.reason || "Banned by operator";
          const ok = await executor.banPlayer(serverId, identifier.trim(), reason);
          if (!ok) return res.status(409).json({ error: ACTION_FAILED });
          return res.json({ success: true, message: `Banned player ${identifier}` });
        }

        if (type === "banned-ips" || type === "banned_ips") {
          const reason = body.reason || "Banned IP";
          const ok = await executor.banIp(serverId, identifier.trim(), reason);
          if (!ok) return res.status(409).json({ error: ACTION_FAILED });
          return res.json({ success: true, message: `Banned IP ${identifier}` });
        }

        res.status(400).json({ error: `Unknown list type: ${type}` });
      },
    },

    // 4. Remove from list
    {
      method: "DELETE",
      path: "/servers/:serverId/lists/:type/:identifier",
      permission: "ext.players.manage_access",
      handler: async (req, res) => {
        const { serverId, type, identifier } = req.params;

        if (!identifier) {
          return res.status(400).json({ error: "Missing identifier in URL path" });
        }

        if (type === "whitelist") {
          const ok = await executor.removeFromWhitelist(serverId, identifier);
          if (!ok) return res.status(409).json({ error: ACTION_FAILED });
          return res.json({ success: true, message: `Removed ${identifier} from whitelist` });
        }

        if (type === "ops") {
          const ok = await executor.deopPlayer(serverId, identifier);
          if (!ok) return res.status(409).json({ error: ACTION_FAILED });
          return res.json({ success: true, message: `Revoked OP from ${identifier}` });
        }

        if (type === "banned-players" || type === "banned_players") {
          const ok = await executor.unbanPlayer(serverId, identifier);
          if (!ok) return res.status(409).json({ error: ACTION_FAILED });
          return res.json({ success: true, message: `Pardoned player ${identifier}` });
        }

        if (type === "banned-ips" || type === "banned_ips") {
          const ok = await executor.unbanIp(serverId, identifier);
          if (!ok) return res.status(409).json({ error: ACTION_FAILED });
          return res.json({ success: true, message: `Pardoned IP ${identifier}` });
        }

        res.status(400).json({ error: `Unknown list type: ${type}` });
      },
    },
  ];
}
