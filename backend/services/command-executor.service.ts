import type { KubekExtensionContext } from "@kubekpanel/extension-sdk";
import type { MinecraftFilesService } from "./minecraft-files.service";

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
    const uuid = this.resolveUuid(serverId, username);
    if (!uuid) return false;

    list.push({ uuid, name: username });
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
    const uuid = this.resolveUuid(serverId, username);
    if (!uuid) return false;

    list.push({ uuid, name: username, level: 4, bypassesPlayerLimit: false });
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
    const uuid = this.resolveUuid(serverId, username);
    if (!uuid) return false;

    list.push({
      uuid,
      name: username,
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
  private resolveUuid(serverId: string, username: string): string | null {
    const entry = this.files
      .getUserCache(serverId)
      .find((e) => e.name.toLowerCase() === username.toLowerCase());
    return entry?.uuid ?? null;
  }
}
