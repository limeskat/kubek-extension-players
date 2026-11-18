import type { KubekExtensionContext } from "@kubekpanel/extension-sdk";
import { createHash } from "node:crypto";
import type { MinecraftFilesService } from "./minecraft-files.service";

/** Java's UUID.nameUUIDFromBytes("OfflinePlayer:<name>"): md5, version 3, RFC 4122 variant. */
export function offlineUuid(name: string): string {
  const bytes = createHash("md5").update(`OfflinePlayer:${name}`, "utf8").digest();
  bytes[6] = (bytes[6] & 0x0f) | 0x30;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function formatMojangId(id: string): string {
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

type MojangProfile = { id: string; name: string };

const mojangCache = new Map<string, MojangProfile | null>();

/** Test helper: a cached miss would otherwise stick for the whole process. */
export function clearMojangCache(): void {
  mojangCache.clear();
}

/** Look a name up once per process; null is cached too so a dead API is not re-hammered. */
export async function lookupMojangProfile(username: string): Promise<MojangProfile | null> {
  const key = username.toLowerCase();
  if (mojangCache.has(key)) return mojangCache.get(key) ?? null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`,
      { signal: controller.signal },
    );
    clearTimeout(timer);

    if (!response.ok) {
      mojangCache.set(key, null);
      return null;
    }
    const body = (await response.json()) as { id?: string; name?: string };
    if (!body?.id || !body?.name) {
      mojangCache.set(key, null);
      return null;
    }
    const profile = { id: body.id, name: body.name };
    mojangCache.set(key, profile);
    return profile;
  } catch {
    mojangCache.set(key, null);
    return null;
  }
}

export class CommandExecutorService {
  constructor(
    private ctx: KubekExtensionContext,
    private files: MinecraftFilesService,
  ) {}

  /**
   * Check if a server is currently in 'running' status
   */
  isServerRunning(serverId: string): boolean {
    const summary = this.ctx.servers.get(serverId);
    return summary?.status === "running";
  }

  /**
   * Send a console command if the server is running
   */
  async sendCommand(serverId: string, cmd: string): Promise<boolean> {
    if (!this.isServerRunning(serverId)) return false;
    try {
      return await this.ctx.servers.sendCommand(serverId, cmd);
    } catch {
      return false;
    }
  }

  // --- Player Actions ---

  async kickPlayer(serverId: string, username: string, reason = "Kicked by administrator"): Promise<boolean> {
    return this.sendCommand(serverId, `kick ${username} ${reason}`);
  }

  async setGamemode(serverId: string, username: string, gamemode: string): Promise<boolean> {
    const mode = gamemode.toLowerCase();
    return this.sendCommand(serverId, `gamemode ${mode} ${username}`);
  }

  async healPlayer(serverId: string, username: string): Promise<boolean> {
    // Give instant health level 255 (instant full heal) + saturation
    const ok1 = await this.sendCommand(serverId, `effect give ${username} minecraft:instant_health 1 255`);
    const ok2 = await this.sendCommand(serverId, `effect give ${username} minecraft:saturation 1 255`);
    return ok1 || ok2;
  }

  async killPlayer(serverId: string, username: string): Promise<boolean> {
    return this.sendCommand(serverId, `kill ${username}`);
  }

  async feedPlayer(serverId: string, username: string): Promise<boolean> {
    return this.sendCommand(serverId, `effect give ${username} minecraft:saturation 1 255`);
  }

  async starvePlayer(serverId: string, username: string): Promise<boolean> {
    return this.sendCommand(serverId, `effect give ${username} minecraft:hunger 10 255`);
  }

  async teleportPlayer(
    serverId: string,
    username: string,
    location: { world?: string; x: number; y: number; z: number },
  ): Promise<boolean> {
    const { world, x, y, z } = location;
    if (world && world !== "minecraft:overworld") {
      return this.sendCommand(
        serverId,
        `execute in ${world} run tp ${username} ${x} ${y} ${z}`,
      );
    }
    return this.sendCommand(serverId, `tp ${username} ${x} ${y} ${z}`);
  }

  // --- Access Lists Orchestration ---

  async addToWhitelist(serverId: string, username: string): Promise<boolean> {
    // A running server owns these files; let the command update them so a concurrent
    // save cannot overwrite our edit.
    if (this.isServerRunning(serverId)) {
      return this.sendCommand(serverId, `whitelist add ${username}`);
    }

    const list = this.files.getWhitelist(serverId);
    if (
      list.some((e) => e.name.toLowerCase() === username.toLowerCase())
    ) {
      return true;
    }
    const profile = await this.resolveProfile(serverId, username);
    if (!profile) return false;

    list.push(profile);
    this.files.setWhitelist(serverId, list);
    return true;
  }

  async removeFromWhitelist(serverId: string, identifier: string): Promise<boolean> {
    if (this.isServerRunning(serverId)) {
      return this.sendCommand(serverId, `whitelist remove ${identifier}`);
    }

    const list = this.files.getWhitelist(serverId);
    const filtered = list.filter(
      (e) =>
        e.name.toLowerCase() !== identifier.toLowerCase() &&
        e.uuid?.toLowerCase() !== identifier.toLowerCase(),
    );
    this.files.setWhitelist(serverId, filtered);
    return true;
  }

  async opPlayer(serverId: string, username: string): Promise<boolean> {
    if (this.isServerRunning(serverId)) {
      return this.sendCommand(serverId, `op ${username}`);
    }

    const list = this.files.getOps(serverId);
    if (list.some((e) => e.name.toLowerCase() === username.toLowerCase())) {
      return true;
    }
    const profile = await this.resolveProfile(serverId, username);
    if (!profile) return false;

    list.push({ ...profile, level: 4, bypassesPlayerLimit: false });
    this.files.setOps(serverId, list);
    return true;
  }

  async deopPlayer(serverId: string, identifier: string): Promise<boolean> {
    if (this.isServerRunning(serverId)) {
      return this.sendCommand(serverId, `deop ${identifier}`);
    }

    const list = this.files.getOps(serverId);
    const filtered = list.filter(
      (e) =>
        e.name.toLowerCase() !== identifier.toLowerCase() &&
        e.uuid?.toLowerCase() !== identifier.toLowerCase(),
    );
    this.files.setOps(serverId, filtered);
    return true;
  }

  async banPlayer(serverId: string, username: string, reason = "Banned by operator"): Promise<boolean> {
    if (this.isServerRunning(serverId)) {
      return this.sendCommand(serverId, `ban ${username} ${reason}`);
    }

    const list = this.files.getBannedPlayers(serverId);
    if (list.some((e) => e.name.toLowerCase() === username.toLowerCase())) {
      return true;
    }
    const profile = await this.resolveProfile(serverId, username);
    if (!profile) return false;

    list.push({
      uuid: profile.uuid,
      name: profile.name,
      created: new Date().toISOString(),
      source: "Server",
      expires: "forever",
      reason,
    });
    this.files.setBannedPlayers(serverId, list);
    return true;
  }

  async unbanPlayer(serverId: string, identifier: string): Promise<boolean> {
    if (this.isServerRunning(serverId)) {
      return this.sendCommand(serverId, `pardon ${identifier}`);
    }

    const list = this.files.getBannedPlayers(serverId);
    const filtered = list.filter(
      (e) =>
        e.name.toLowerCase() !== identifier.toLowerCase() &&
        e.uuid?.toLowerCase() !== identifier.toLowerCase(),
    );
    this.files.setBannedPlayers(serverId, filtered);
    return true;
  }

  async banIp(serverId: string, ip: string, reason = "Banned IP"): Promise<boolean> {
    if (this.isServerRunning(serverId)) {
      return this.sendCommand(serverId, `ban-ip ${ip} ${reason}`);
    }

    const list = this.files.getBannedIps(serverId);
    if (list.some((e) => e.ip === ip)) return true;

    list.push({
      ip,
      created: new Date().toISOString(),
      source: "Server",
      expires: "forever",
      reason,
    });
    this.files.setBannedIps(serverId, list);
    return true;
  }

  async unbanIp(serverId: string, ip: string): Promise<boolean> {
    if (this.isServerRunning(serverId)) {
      return this.sendCommand(serverId, `pardon-ip ${ip}`);
    }

    const list = this.files.getBannedIps(serverId);
    const filtered = list.filter((e) => e.ip !== ip);
    this.files.setBannedIps(serverId, filtered);
    return true;
  }

  /** Resolve a player name to the UUID stored in usercache.json (offline fallback). */
  /**
   * UUID + canonical name for a player. Usercache first, then Mojang (which fixes casing),
   * then the offline-mode UUID derived from the name. Online-mode servers never fall back
   * to an offline UUID, because it would not match the account at login.
   */
  private async resolveProfile(
    serverId: string,
    username: string,
  ): Promise<{ uuid: string; name: string } | null> {
    const entry = this.files
      .getUserCache(serverId)
      .find((e) => e.name.toLowerCase() === username.toLowerCase());
    if (entry) return { uuid: entry.uuid, name: entry.name };

    const online = this.files.getServerProperties(serverId)["online-mode"] !== "false";

    // Offline-mode identity is md5("OfflinePlayer:<exact name>"): the spelling IS the uuid,
    // so Mojang's canonical casing would whitelist a different player than the one logging in.
    if (!online) return { uuid: offlineUuid(username), name: username };

    const profile = await lookupMojangProfile(username);
    if (!profile) return null;
    return { uuid: formatMojangId(profile.id), name: profile.name };
  }
}
