import fs from "node:fs";
import type { PlayerStats } from "../types";

export class StatsParserService {
  /**
   * Parse a player's JSON statistics file
   */
  parseStatsFile(filePath: string): PlayerStats {
    const defaultStats: PlayerStats = {
      playtimeText: "No data",
      playerKills: 0,
      deaths: 0,
      kdr: 0,
      distanceTotal: 0,
      distanceSprinted: 0,
      distanceWalked: 0,
      blocksBroken: null,
      itemsUsed: null,
      entitiesKilled: null,
    };

    try {
      if (!fs.existsSync(filePath)) return defaultStats;
      const content = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(content);
      const stats = json.stats ?? {};
      const custom = stats["minecraft:custom"] ?? {};

      // 1. Playtime: play_time or total_world_time is in ticks (20 ticks = 1 sec)
      const playTicks =
        Number(custom["minecraft:play_time"] ?? custom["minecraft:total_world_time"] ?? 0);
      const playtimeSeconds = Math.floor(playTicks / 20);
      const playtimeText = this.formatPlaytime(playtimeSeconds);

      // 2. Kills & Deaths & KDR
      const playerKills = Number(custom["minecraft:player_kills"] ?? 0);
      const deaths = Number(custom["minecraft:deaths"] ?? 0);
      const kdr = deaths === 0 ? playerKills : +(playerKills / deaths).toFixed(2);

      // 3. Distances (stored in cm, 100 cm = 1 block)
      const walkedCm = Number(custom["minecraft:walk_one_cm"] ?? 0);
      const sprintedCm = Number(custom["minecraft:sprint_one_cm"] ?? 0);
      const flownCm = Number(custom["minecraft:fly_one_cm"] ?? 0);
      const fallenCm = Number(custom["minecraft:fall_one_cm"] ?? 0);
      const onWaterCm = Number(custom["minecraft:walk_on_water_one_cm"] ?? 0);

      const distanceWalked = Math.round(walkedCm / 100);
      const distanceSprinted = Math.round(sprintedCm / 100);
      const distanceTotal = Math.round(
        (walkedCm + sprintedCm + flownCm + fallenCm + onWaterCm) / 100,
      );

      // 4. Broken Blocks (Mined)
      const minedMap = stats["minecraft:mined"];
      let blocksBroken: number | null = null;
      if (minedMap && typeof minedMap === "object") {
        blocksBroken = Object.values(minedMap).reduce<number>(
          (acc, val) => acc + (Number(val) || 0),
          0,
        );
      }

      // 5. Items Used
      const usedMap = stats["minecraft:used"];
      let itemsUsed: number | null = null;
      if (usedMap && typeof usedMap === "object") {
        itemsUsed = Object.values(usedMap).reduce<number>(
          (acc, val) => acc + (Number(val) || 0),
          0,
        );
      }

      // 6. Entities Killed
      const killedMap = stats["minecraft:killed"];
      let entitiesKilled: number | null = null;
      if (killedMap && typeof killedMap === "object") {
        entitiesKilled = Object.values(killedMap).reduce<number>(
          (acc, val) => acc + (Number(val) || 0),
          0,
        );
      }

      return {
        playtimeText,
        playerKills,
        deaths,
        kdr,
        distanceTotal,
        distanceSprinted,
        distanceWalked,
        blocksBroken,
        itemsUsed,
        entitiesKilled,
      };
    } catch {
      return defaultStats;
    }
  }

  private formatPlaytime(totalSeconds: number): string {
    if (totalSeconds <= 0) return "Less than a minute";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
    return "Less than a minute";
  }
}
