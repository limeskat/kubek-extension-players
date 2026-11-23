import type { KubekExtensionContext } from "@kubekpanel/extension-sdk";
import { createListsRoutes } from "./controllers/lists.controller";
import { createPlayersRoutes } from "./controllers/players.controller";
import { CommandExecutorService } from "./services/command-executor.service";
import { MinecraftFilesService } from "./services/minecraft-files.service";
import { NbtParserService } from "./services/nbt-parser.service";
import { OnlineTracker } from "./services/online-tracker.service";
import { type AvatarProvider, SkinAvatarService } from "./services/skin-avatar.service";
import { StatsParserService } from "./services/stats-parser.service";

// In-memory tracker of online players per server, seeded from the panel events and the log tail
let onlineTracker: OnlineTracker | undefined;

const AVATAR_PROVIDERS: AvatarProvider[] = [
  "crafatar",
  "minotar",
  "mc-heads",
  "visage",
];

export async function activate(ctx: KubekExtensionContext) {
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
  const tracker = new OnlineTracker(files);
  onlineTracker = tracker;

  // The panel does not emit player events on every core, so the log tail is the source of
  // truth. Replay it for servers that are already running, otherwise drop stale state.
  try {
    const servers = ctx.servers.list();
    for (const server of servers) {
      if (server.status === "running") tracker.sync(server.id);
      else tracker.clear(server.id);
    }
  } catch (err) {
    ctx.logger.warn("Could not list initial servers", err);
  }

  // Player events are used when the panel has them (for example with Kubek Companion)
  ctx.events.on("player.joined", (event) => {
    const { serverId, player } = event;
    if (!serverId || !player) return;
    tracker.add(serverId, player);
    ctx.logger.info(`[${serverId}] Player joined: ${player}`);
  });

  ctx.events.on("player.left", (event) => {
    const { serverId, player } = event;
    if (!serverId || !player) return;
    tracker.remove(serverId, player);
    ctx.logger.info(`[${serverId}] Player left: ${player}`);
  });

  // A new log starts on every server start; reseed from it in case a player reconnects before
  // the first join line reaches us.
  ctx.events.on("server.started", (event) => {
    if (!event.serverId) return;
    tracker.clear(event.serverId);
    tracker.sync(event.serverId);
  });

  // Fallback for cores without player events: follow join/leave lines as they are printed.
  ctx.events.on("server.log", (event) => {
    const { serverId, line } = event;
    if (!serverId || !line?.line) return;
    tracker.handleLine(serverId, line.line);
  });

  ctx.events.on("server.stopped", (event) => {
    if (event.serverId) tracker.clear(event.serverId);
  });

  ctx.events.on("server.crashed", (event) => {
    if (event.serverId) tracker.clear(event.serverId);
  });

  // Register HTTP REST Routes
  const listsRoutes = createListsRoutes(files, executor, avatar);
  const playersRoutes = createPlayersRoutes(
    files,
    nbtParser,
    statsParser,
    executor,
    avatar,
    tracker,
  );

  ctx.http.registerRoutes([...listsRoutes, ...playersRoutes]);

  ctx.logger.info("Kubek Players Management Extension successfully activated");
}

export async function deactivate() {
  onlineTracker?.clearAll();
  onlineTracker = undefined;
}
