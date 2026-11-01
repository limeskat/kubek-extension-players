import type { KubekExtensionContext } from "@kubekpanel/extension-sdk";
import { createListsRoutes } from "./controllers/lists.controller";
import { createPlayersRoutes } from "./controllers/players.controller";
import { CommandExecutorService } from "./services/command-executor.service";
import { MinecraftFilesService } from "./services/minecraft-files.service";
import { NbtParserService } from "./services/nbt-parser.service";
import { type AvatarProvider, SkinAvatarService } from "./services/skin-avatar.service";
import { StatsParserService } from "./services/stats-parser.service";

// In-memory tracker of online players per server
const onlineTracker = new Map<string, Set<string>>();

const AVATAR_PROVIDERS: AvatarProvider[] = [
  "crafatar",
  "minotar",
  "mc-heads",
  "visage",
];

export async function activate(ctx: KubekExtensionContext) {
  ctx.logger.info(
    "Players extension bundle build 1.0.2 loaded (offline teleport + NBT writer)",
  );
  ctx.logger.info(`Activating Kubek Players Management Extension v${ctx.version}`);

  // Instantiate Core Services
  const files = new MinecraftFilesService();
  const nbtParser = new NbtParserService();
  const statsParser = new StatsParserService();
  const avatar = new SkinAvatarService(() => {
    const configured = ctx.config.get<AvatarProvider>("avatarProvider");
    return configured && AVATAR_PROVIDERS.includes(configured)
      ? configured
      : "mc-heads";
  });
  const executor = new CommandExecutorService(ctx, files);

  // Initialize online sets for known servers. The panel has no player events of its own,
  // so a panel/extension reload while a server is running would otherwise show nobody
  // online until the next join. Replay the current log to recover the real set.
  try {
    const servers = ctx.servers.list();
    for (const server of servers) {
      onlineTracker.set(
        server.id,
        server.status === "running"
          ? files.getOnlinePlayersFromLog(server.id)
          : new Set<string>(),
      );
    }
  } catch (err) {
    ctx.logger.warn("Could not list initial servers", err);
  }

  // 1. Listen for player join events from panel bus
  ctx.events.on("player.joined", (event) => {
    const { serverId, player } = event;
    if (serverId && player) {
      if (!onlineTracker.has(serverId)) {
        onlineTracker.set(serverId, new Set<string>());
      }
      onlineTracker.get(serverId)!.add(player);
      ctx.logger.info(`[${serverId}] Player joined: ${player}`);
    }
  });

  // 2. Listen for player leave events from panel bus
  ctx.events.on("player.left", (event) => {
    const { serverId, player } = event;
    if (serverId && player && onlineTracker.has(serverId)) {
      onlineTracker.get(serverId)!.delete(player);
      ctx.logger.info(`[${serverId}] Player left: ${player}`);
    }
  });

  // 3. Seed the online set from the log when a server starts (players can reconnect
  // between the start event and the first join line the bus delivers).
  ctx.events.on("server.started", (event) => {
    if (!event.serverId) return;
    onlineTracker.set(event.serverId, files.getOnlinePlayersFromLog(event.serverId));
  });

  // 4. Fallback log scraper for join/leave patterns in server.log
  ctx.events.on("server.log", (event) => {
    const { serverId, line } = event;
    if (!serverId || !line?.line) return;
    const text = line.line;

    // Pattern: Player [name] joined the game
    const joinMatch = text.match(/\]:\s+([a-zA-Z0-9_]{1,16})\s+joined the game/i);
    if (joinMatch) {
      const name = joinMatch[1];
      if (!onlineTracker.has(serverId)) {
        onlineTracker.set(serverId, new Set<string>());
      }
      onlineTracker.get(serverId)!.add(name);
    }

    // Pattern: Player [name] left the game / lost connection
    const leaveMatch = text.match(/\]:\s+([a-zA-Z0-9_]{1,16})\s+(?:left the game|lost connection)/i);
    if (leaveMatch) {
      const name = leaveMatch[1];
      if (onlineTracker.has(serverId)) {
        onlineTracker.get(serverId)!.delete(name);
      }
    }
  });

  // 5. Server stopped / crashed cleanup
  ctx.events.on("server.stopped", (event) => {
    if (event.serverId && onlineTracker.has(event.serverId)) {
      onlineTracker.get(event.serverId)!.clear();
    }
  });

  ctx.events.on("server.crashed", (event) => {
    if (event.serverId && onlineTracker.has(event.serverId)) {
      onlineTracker.get(event.serverId)!.clear();
    }
  });

  // 6. Register HTTP REST Routes
  const listsRoutes = createListsRoutes(files, executor, avatar);
  const playersRoutes = createPlayersRoutes(
    files,
    nbtParser,
    statsParser,
    executor,
    avatar,
    onlineTracker,
  );

  ctx.http.registerRoutes([...listsRoutes, ...playersRoutes]);

  ctx.logger.info("Kubek Players Management Extension successfully activated");
}

export async function deactivate() {
  onlineTracker.clear();
}
