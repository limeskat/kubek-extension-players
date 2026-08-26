import fs from "node:fs";
import path from "node:path";
import type {
  BannedIpEntry,
  BannedPlayerEntry,
  OpEntry,
  UserCacheEntry,
  WhitelistEntry,
} from "../types";

export class MinecraftFilesService {
  /**
   * Resolve a safe absolute path inside the server directory
   */
  getSafePath(serverId: string, subPath = ""): string {
    if (!serverId || /[\\/]|\.\./.test(serverId)) {
      throw new Error(`Invalid server id: "${serverId}"`);
    }
    const base = path.resolve("./servers", serverId);
    const full = path.resolve(path.join(base, path.normalize(subPath)));

    if (full !== base && !full.startsWith(base + path.sep)) {
      throw new Error("Directory traversal attempt detected");
    }
    return full;
  }

  /**
   * Read and parse a JSON file, returning defaultValue if not found or corrupted
   */
  readJsonFile<T>(filePath: string, defaultValue: T): T {
    try {
      if (!fs.existsSync(filePath)) return defaultValue;
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as T;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Safely write a JSON file formatted with 2 spaces
   */
  writeJsonFile<T>(filePath: string, data: T): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  // --- List Files ---

  getWhitelist(serverId: string): WhitelistEntry[] {
    const p = this.getSafePath(serverId, "whitelist.json");
    return this.readJsonFile<WhitelistEntry[]>(p, []);
  }

  setWhitelist(serverId: string, list: WhitelistEntry[]): void {
    const p = this.getSafePath(serverId, "whitelist.json");
    this.writeJsonFile(p, list);
  }

  getOps(serverId: string): OpEntry[] {
    const p = this.getSafePath(serverId, "ops.json");
    return this.readJsonFile<OpEntry[]>(p, []);
  }

  setOps(serverId: string, list: OpEntry[]): void {
    const p = this.getSafePath(serverId, "ops.json");
    this.writeJsonFile(p, list);
  }

  getBannedPlayers(serverId: string): BannedPlayerEntry[] {
    const p = this.getSafePath(serverId, "banned-players.json");
    return this.readJsonFile<BannedPlayerEntry[]>(p, []);
  }

  setBannedPlayers(serverId: string, list: BannedPlayerEntry[]): void {
    const p = this.getSafePath(serverId, "banned-players.json");
    this.writeJsonFile(p, list);
  }

  getBannedIps(serverId: string): BannedIpEntry[] {
    const p = this.getSafePath(serverId, "banned-ips.json");
    return this.readJsonFile<BannedIpEntry[]>(p, []);
  }

  setBannedIps(serverId: string, list: BannedIpEntry[]): void {
    const p = this.getSafePath(serverId, "banned-ips.json");
    this.writeJsonFile(p, list);
  }

  getUserCache(serverId: string): UserCacheEntry[] {
    const p = this.getSafePath(serverId, "usercache.json");
    return this.readJsonFile<UserCacheEntry[]>(p, []);
  }

  // --- Directory Resolution for Player Data & Stats ---

  findPlayerDataPath(serverId: string, uuid: string): string | null {
    const candidates = [
      this.getSafePath(serverId, `world/playerdata/${uuid}.dat`),
      this.getSafePath(serverId, `world/players/data/${uuid}.dat`),
      this.getSafePath(serverId, `playerdata/${uuid}.dat`),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return candidates[0]; // fallback default path
  }

  findPlayerStatsPath(serverId: string, uuid: string): string | null {
    const candidates = [
      this.getSafePath(serverId, `world/stats/${uuid}.json`),
      this.getSafePath(serverId, `world/players/stats/${uuid}.json`),
      this.getSafePath(serverId, `stats/${uuid}.json`),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return candidates[0];
  }

  findPlayerAdvancementsPath(serverId: string, uuid: string): string | null {
    const candidates = [
      this.getSafePath(serverId, `world/advancements/${uuid}.json`),
      this.getSafePath(serverId, `world/players/advancements/${uuid}.json`),
      this.getSafePath(serverId, `advancements/${uuid}.json`),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return candidates[0];
  }

  /**
   * Discover all player UUIDs from usercache, playerdata, and stats directories
   */
  getAllDiscoveredPlayers(
    serverId: string,
  ): Array<{ uuid: string; username?: string }> {
    const map = new Map<string, { uuid: string; username?: string }>();

    // 1. Read usercache.json
    const cache = this.getUserCache(serverId);
    for (const entry of cache) {
      if (entry.uuid) {
        map.set(entry.uuid.toLowerCase(), {
          uuid: entry.uuid.toLowerCase(),
          username: entry.name,
        });
      }
    }

    // 2. Scan world/playerdata or world/players/data
    const candidateDirs = [
      this.getSafePath(serverId, "world/playerdata"),
      this.getSafePath(serverId, "world/players/data"),
      this.getSafePath(serverId, "playerdata"),
    ];

    for (const dir of candidateDirs) {
      if (fs.existsSync(dir)) {
        try {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            if (file.endsWith(".dat") && !file.endsWith(".dat_old")) {
              const uuid = file.slice(0, -4).toLowerCase();
              if (!map.has(uuid)) {
                map.set(uuid, { uuid });
              }
            }
          }
        } catch {}
      }
    }

    return Array.from(map.values());
  }
}
