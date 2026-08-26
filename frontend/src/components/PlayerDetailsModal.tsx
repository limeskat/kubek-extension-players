import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  MinecraftHeart,
  MinecraftFood,
  SlotHelmetIcon,
  SlotChestplateIcon,
  SlotLeggingsIcon,
  SlotBootsIcon,
  SlotShieldIcon,
} from "./MinecraftIcons";
import { GamemodeSelect } from "./GamemodeSelect";
import { TeleportModal } from "./modals/TeleportModal";
import { PurgeConfirmModal } from "./modals/PurgeConfirmModal";

interface PlayerDetailsModalProps {
  serverId: string;
  uuid: string;
  onClose: () => void;
  onChanged: () => void;
}

export const PlayerDetailsModal: React.FC<PlayerDetailsModalProps> = ({
  serverId,
  uuid,
  onClose,
  onChanged,
}) => {
  const kubek = typeof window !== "undefined" ? window.Kubek : undefined;
  if (!kubek) return null;

  const { ui, icons = {}, http, query, hooks } = kubek;
  const { t } = hooks?.useTranslation?.() || { t: (k: string) => k };

  const [showTeleport, setShowTeleport] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [inventoryTab, setInventoryTab] = useState<"main" | "ender">("main");

  // Purge Checkbox States
  const [purgeOptions, setPurgeOptions] = useState({
    experiencePoints: false,
    inventory: false,
    enderChest: false,
    playerDataFile: false,
    statisticsFile: false,
    advancementsFile: false,
  });
  const [selectAllPurge, setSelectAllPurge] = useState(false);

  // Fetch Player Details
  const detailsQuery = query.useQuery({
    queryKey: ["ext", "players", serverId, "player", uuid],
    queryFn: () => http.get<any>(`ext/com.kubek.players/servers/${serverId}/players/${uuid}`),
    refetchInterval: 6000,
  });

  const details = detailsQuery.data;

  // Mutations
  const vitalsMutation = query.useMutation({
    mutationFn: (action: string) =>
      http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/vitals`, { action }),
    onSuccess: () => {
      detailsQuery.refetch();
      onChanged();
    },
  });

  const gamemodeMutation = query.useMutation({
    mutationFn: (gamemode: string) =>
      http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/gamemode`, { gamemode }),
    onSuccess: () => {
      detailsQuery.refetch();
      onChanged();
    },
  });

  const kickMutation = query.useMutation({
    mutationFn: () =>
      http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/kick`),
    onSuccess: () => {
      detailsQuery.refetch();
      onChanged();
    },
  });

  const permissionMutation = query.useMutation({
    mutationFn: (body: { perm: string; value: boolean }) =>
      http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/permissions`, body),
    onSuccess: () => {
      detailsQuery.refetch();
      onChanged();
    },
  });

  const purgeMutation = query.useMutation({
    mutationFn: (body: any) =>
      http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/purge`, body),
    onSuccess: () => {
      setShowPurgeConfirm(false);
      detailsQuery.refetch();
      onChanged();
      alert("Selected player data has been purged successfully.");
    },
  });

  const handleCopyUuid = () => {
    if (details?.summary?.uuid) {
      navigator.clipboard.writeText(details.summary.uuid);
      setCopiedUuid(true);
      setTimeout(() => setCopiedUuid(false), 2000);
    }
  };

  const handleToggleSelectAll = (checked: boolean) => {
    setSelectAllPurge(checked);
    setPurgeOptions({
      experiencePoints: checked,
      inventory: checked,
      enderChest: checked,
      playerDataFile: checked,
      statisticsFile: checked,
      advancementsFile: checked,
    });
  };

  const handleOpenPurgeDialog = () => {
    const hasSelected = Object.values(purgeOptions).some(Boolean);
    if (!hasSelected) {
      alert("Please select at least one data category to delete.");
      return;
    }
    setShowPurgeConfirm(true);
  };

  const UserIcon = icons.User || (() => null);
  const RefreshIcon = icons.RefreshCw || (() => null);
  const XIcon = icons.X || (() => null);
  const CheckIcon = icons.Check || (() => null);
  const CopyIcon = icons.Copy || (() => null);
  const UserXIcon = icons.UserX || icons.User || (() => null);
  const ActivityIcon = icons.Activity || (() => null);
  const SkullIcon = icons.Skull || (() => null);
  const HeartPulseIcon = icons.HeartPulse || icons.Heart || icons.Activity || (() => null);
  const UtensilsIcon = icons.Utensils || icons.Apple || icons.Flame || (() => null);
  const ShieldIcon = icons.Shield || (() => null);
  const UserCheckIcon = icons.UserCheck || icons.User || (() => null);
  const CrownIcon = icons.Crown || icons.Shield || (() => null);
  const MapPinIcon = icons.MapPin || (() => null);
  const SparklesIcon = icons.Sparkles || (() => null);
  const BoxIcon = icons.Box || (() => null);
  const BarChartIcon = icons.BarChart3 || icons.BarChart || (() => null);
  const ClockIcon = icons.Clock || (() => null);
  const SwordsIcon = icons.Swords || (() => null);
  const GaugeIcon = icons.Gauge || (() => null);
  const TrashIcon = icons.Trash2 || (() => null);
  const FootprintsIcon = icons.Footprints || icons.Activity || (() => null);
  const PickaxeIcon = icons.Hammer || icons.Wrench || (() => null);

  // Render 10 Hearts for HP with flat vector SVGs
  const renderHearts = (hp: number = 20) => {
    const hearts = [];
    const validHp = typeof hp === "number" && !isNaN(hp) ? hp : 20;
    for (let i = 1; i <= 10; i++) {
      const heartValue = i * 2;
      const type: "full" | "half" | "empty" =
        validHp >= heartValue ? "full" : validHp >= heartValue - 1 ? "half" : "empty";
      hearts.push(
        <div key={`heart-slot-${i}`} className="w-5 h-5 flex items-center justify-center">
          <MinecraftHeart type={type} className="w-5 h-5" />
        </div>,
      );
    }
    return hearts;
  };

  // Render 10 Drumsticks for Hunger/Food with flat vector SVGs
  const renderFood = (food: number = 20) => {
    const drumsticks = [];
    const validFood = typeof food === "number" && !isNaN(food) ? food : 20;
    for (let i = 1; i <= 10; i++) {
      const foodValue = i * 2;
      const type: "full" | "half" | "empty" =
        validFood >= foodValue ? "full" : validFood >= foodValue - 1 ? "half" : "empty";
      drumsticks.push(
        <div key={`food-slot-${i}`} className="w-5 h-5 flex items-center justify-center">
          <MinecraftFood type={type} className="w-5 h-5" />
        </div>,
      );
    }
    return drumsticks;
  };

  // Helper to render an inventory slot with item image / fallback
  const renderSlot = (item: any, slotKey: string, placeholderIcon?: React.ReactNode) => {
    if (!item) {
      return (
        <div key={slotKey} className="mc-slot" title="Empty">
          {placeholderIcon || null}
        </div>
      );
    }

    const cleanId = (item.id || "").replace("minecraft:", "");
    const itemImgUrl = `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/${cleanId}.png`;
    const blockImgUrl = `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/block/${cleanId}.png`;

    return (
      <div
        key={slotKey}
        className="mc-slot mc-slot-filled cursor-pointer"
        title={`${item.displayName || cleanId} (${item.id}) x${item.count || 1}`}
      >
        <img
          src={itemImgUrl}
          alt={item.displayName}
          className="mc-slot-item-img"
          onError={(e: any) => {
            if (e.target.src !== blockImgUrl) {
              e.target.src = blockImgUrl;
            } else {
              e.target.style.display = "none";
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = "block";
              }
            }
          }}
        />
        <span
          className="mc-slot-item-text"
          style={{ display: "none" }}
        >
          {(item.displayName || cleanId).slice(0, 3)}
        </span>
        {item.count > 1 && (
          <span className="mc-slot-count">{item.count}</span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-3">
            <UserIcon className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-foreground">
              {t("ext.players.details") || "Player details"}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Refreshed {details?.lastRefreshedText || "just now"}
            </span>
            <button
              type="button"
              onClick={() => detailsQuery.refetch()}
              disabled={detailsQuery.isLoading}
              className="px-3 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RefreshIcon
                className={`w-3.5 h-3.5 ${detailsQuery.isLoading ? "animate-spin" : ""}`}
              />
              {t("ext.players.refresh") || "Refresh"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {detailsQuery.isLoading && !details ? (
          <div className="flex-1 flex items-center justify-center py-24 text-muted-foreground">
            <RefreshIcon className="w-8 h-8 animate-spin mr-3 text-primary" />
            Loading player details...
          </div>
        ) : (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* 1. Header Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-muted/60 to-muted/20 border border-border/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={details?.summary?.skinAvatarUrl || `https://crafatar.com/avatars/${details?.summary?.username}?size=56`}
                    alt={details?.summary?.username}
                    className="w-14 h-14 rounded-2xl bg-background shadow-md border-2 border-border/80 object-cover"
                    onError={(e: any) => {
                      e.target.src = "https://crafatar.com/avatars/steve?size=56";
                    }}
                  />
                  {details?.summary?.isOnline && (
                    <div className="absolute -bottom-1 -right-1 players-pulse-dot border-2 border-card" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-black text-foreground">
                      {details?.summary?.username}
                    </h2>
                    {details?.summary?.isOnline ? (
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Online
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full font-medium text-xs bg-muted text-muted-foreground border border-border">
                        Offline
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyUuid}
                    className="flex items-center gap-1.5 mt-1 text-xs font-mono text-muted-foreground hover:text-foreground transition group"
                    title="Click to copy UUID"
                  >
                    <span>{details?.summary?.uuid}</span>
                    {copiedUuid ? (
                      <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <CopyIcon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Gamemode Dropdown */}
                <GamemodeSelect
                  value={details?.gamemode || "Survival"}
                  onChange={(mode) => gamemodeMutation.mutate(mode)}
                  disabled={gamemodeMutation.isPending}
                />

                {/* Kick Button */}
                <button
                  type="button"
                  onClick={() => kickMutation.mutate()}
                  disabled={kickMutation.isPending || !details?.summary?.isOnline}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition disabled:opacity-40 flex items-center gap-1.5"
                >
                  <UserXIcon className="w-3.5 h-3.5" />
                  {t("ext.players.kick") || "Kick"}
                </button>
              </div>
            </div>

            {/* 60 / 40 Split Main Section */}
            <div className="mc-split-container">
              {/* LEFT 60% COLUMN (Health and Experience + Inventory) */}
              <div className="mc-split-left">
                {/* Module 1: Vitals & Experience */}
                <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <ActivityIcon className="w-4 h-4 text-emerald-400" />
                      {t("ext.players.vitals") || "Health and Experience"}
                    </h4>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      Level {details?.vitals?.level ?? 0}
                    </span>
                  </div>

                  {/* XP Bar */}
                  <div className="mc-bar-bg">
                    <div
                      className="mc-bar-xp"
                      style={{
                        width: `${Math.round((details?.vitals?.xpProgress ?? 0) * 100)}%`,
                      }}
                    />
                  </div>

                  {/* Health Row */}
                  <div className="mc-hud-row">
                    <button
                      type="button"
                      onClick={() => vitalsMutation.mutate("kill")}
                      disabled={vitalsMutation.isPending}
                      className="w-20 py-1.5 rounded-xl bg-rose-600/15 hover:bg-rose-600 border border-rose-500/30 text-rose-400 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 flex-shrink-0"
                      title="Kill player"
                    >
                      <SkullIcon className="w-3.5 h-3.5" />
                      <span>{t("ext.players.kill") || "Kill"}</span>
                    </button>

                    <div className="mc-icons-grid">
                      {renderHearts(details?.vitals?.health)}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="w-24 text-center text-xs font-mono font-extrabold text-rose-400 bg-rose-500/10 py-1 rounded-lg border border-rose-500/20">
                        {details?.vitals?.health ?? 20} / 20 HP
                      </span>

                      <button
                        type="button"
                        onClick={() => vitalsMutation.mutate("heal")}
                        disabled={vitalsMutation.isPending}
                        className="w-20 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-400 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 flex-shrink-0"
                        title="Heal player"
                      >
                        <HeartPulseIcon className="w-3.5 h-3.5" />
                        <span>{t("ext.players.heal") || "Heal"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Hunger / Food Row */}
                  <div className="mc-hud-row">
                    <button
                      type="button"
                      onClick={() => vitalsMutation.mutate("starve")}
                      disabled={vitalsMutation.isPending}
                      className="w-20 py-1.5 rounded-xl bg-rose-600/15 hover:bg-rose-600 border border-rose-500/30 text-rose-400 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 flex-shrink-0"
                      title="Starve player"
                    >
                      <SkullIcon className="w-3.5 h-3.5" />
                      <span>{t("ext.players.starve") || "Starve"}</span>
                    </button>

                    <div className="mc-icons-grid">
                      {renderFood(details?.vitals?.food)}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="w-24 text-center text-xs font-mono font-extrabold text-amber-400 bg-amber-500/10 py-1 rounded-lg border border-amber-500/20">
                        {details?.vitals?.food ?? 20} / 20 Food
                      </span>

                      <button
                        type="button"
                        onClick={() => vitalsMutation.mutate("feed")}
                        disabled={vitalsMutation.isPending}
                        className="w-20 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-400 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 flex-shrink-0"
                        title="Feed player"
                      >
                        <UtensilsIcon className="w-3.5 h-3.5" />
                        <span>{t("ext.players.feed") || "Feed"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Module 2: Inventory Viewer (Exact Authentic Centered Minecraft GUI) */}
                <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <BoxIcon className="w-4 h-4 text-amber-400" />
                      {t("ext.players.inventory") || "Inventory"}
                    </h4>

                    {/* Inventory Tab Switcher */}
                    <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/60 text-xs">
                      <button
                        type="button"
                        onClick={() => setInventoryTab("main")}
                        className={`px-3 py-1 rounded-lg font-bold transition ${
                          inventoryTab === "main"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Inventory
                      </button>
                      <button
                        type="button"
                        onClick={() => setInventoryTab("ender")}
                        className={`px-3 py-1 rounded-lg font-bold transition ${
                          inventoryTab === "ender"
                            ? "bg-purple-600 text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Ender Chest
                      </button>
                    </div>
                  </div>

                  {/* Centered Minecraft Inventory Layout - Unified 11-Column Grid */}
                  <div className="flex justify-center items-center w-full py-2 overflow-x-auto">
                    <div className="mc-inv-container">
                      {inventoryTab === "main" ? (
                        <div className="flex flex-col gap-1">
                          {/* Top 3 Rows: 11 Columns (Armor + Spacer + 9 Storage Slots) */}
                          <div
                            className="grid gap-1"
                            style={{
                              gridTemplateColumns: "54px 54px repeat(9, 54px)",
                              gridTemplateRows: "repeat(3, 54px)",
                            }}
                          >
                            {/* Row 1: Helmet + Spacer + Storage 0..8 */}
                            {renderSlot(
                              details?.inventory?.armor?.helmet,
                              "armor-helmet",
                              <SlotHelmetIcon />,
                            )}
                            <div className="w-[54px] h-[54px] opacity-0 pointer-events-none" />
                            {(details?.inventory?.main?.slice(0, 9) || Array(9).fill(null)).map(
                              (item: any, idx: number) =>
                                renderSlot(item, `main-slot-${idx}`),
                            )}

                            {/* Row 2: Chestplate + Spacer + Storage 9..17 */}
                            {renderSlot(
                              details?.inventory?.armor?.chestplate,
                              "armor-chestplate",
                              <SlotChestplateIcon />,
                            )}
                            <div className="w-[54px] h-[54px] opacity-0 pointer-events-none" />
                            {(details?.inventory?.main?.slice(9, 18) || Array(9).fill(null)).map(
                              (item: any, idx: number) =>
                                renderSlot(item, `main-slot-${9 + idx}`),
                            )}

                            {/* Row 3: Leggings + Spacer + Storage 18..26 */}
                            {renderSlot(
                              details?.inventory?.armor?.leggings,
                              "armor-leggings",
                              <SlotLeggingsIcon />,
                            )}
                            <div className="w-[54px] h-[54px] opacity-0 pointer-events-none" />
                            {(details?.inventory?.main?.slice(18, 27) || Array(9).fill(null)).map(
                              (item: any, idx: number) =>
                                renderSlot(item, `main-slot-${18 + idx}`),
                            )}
                          </div>

                          {/* Dashed Horizontal Divider Line across entire 11 columns */}
                          <div className="border-t border-dashed border-[#555555]/80 my-1 w-full" />

                          {/* Row 4: 11 Columns (Boots + Shield + 9 Hotbar Slots) */}
                          <div
                            className="grid gap-1"
                            style={{
                              gridTemplateColumns: "54px 54px repeat(9, 54px)",
                              gridTemplateRows: "54px",
                            }}
                          >
                            {renderSlot(
                              details?.inventory?.armor?.boots,
                              "armor-boots",
                              <SlotBootsIcon />,
                            )}
                            {renderSlot(
                              details?.inventory?.offhand,
                              "armor-shield",
                              <SlotShieldIcon />,
                            )}
                            {(details?.inventory?.hotbar || Array(9).fill(null)).map(
                              (item: any, idx: number) =>
                                renderSlot(item, `hotbar-slot-${idx}`),
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Ender Chest (27 slots) */
                        <div className="mc-ender-grid">
                          {(details?.inventory?.enderChest || Array(27).fill(null)).map(
                            (item: any, idx: number) =>
                              renderSlot(item, `ender-slot-${idx}`),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT 40% COLUMN (Control + Teleport) */}
              <div className="mc-split-right">
                {/* Module 3: Control (Permission Toggles) */}
                <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-3.5 shadow-sm">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ShieldIcon className="w-4 h-4 text-blue-400" />
                    {t("ext.players.control") || "Control"}
                  </h4>

                  <div className="space-y-2.5">
                    {/* Whitelisted */}
                    <label className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40 cursor-pointer hover:bg-muted/70 transition">
                      <div className="flex items-center gap-2.5">
                        <UserCheckIcon className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {t("ext.players.whitelisted") || "Whitelisted"}
                          </div>
                          <div className="text-[11px] text-muted-foreground">Allow player to join when whitelist is active</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(details?.permissions?.isWhitelisted)}
                        onChange={(e) =>
                          permissionMutation.mutate({
                            perm: "whitelist",
                            value: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </label>

                    {/* Operator */}
                    <label className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40 cursor-pointer hover:bg-muted/70 transition">
                      <div className="flex items-center gap-2.5">
                        <CrownIcon className="w-4 h-4 text-amber-400" />
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {t("ext.players.operator") || "Operator"}
                          </div>
                          <div className="text-[11px] text-muted-foreground">Grant OP level admin commands & permissions</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(details?.permissions?.isOp)}
                        onChange={(e) =>
                          permissionMutation.mutate({
                            perm: "op",
                            value: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                      />
                    </label>

                    {/* Banned */}
                    <label className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40 cursor-pointer hover:bg-muted/70 transition">
                      <div className="flex items-center gap-2.5">
                        <UserXIcon className="w-4 h-4 text-rose-400" />
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {t("ext.players.banned") || "Banned"}
                          </div>
                          <div className="text-[11px] text-muted-foreground">Block player from connecting to the server</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(details?.permissions?.isBanned)}
                        onChange={(e) =>
                          permissionMutation.mutate({
                            perm: "ban",
                            value: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Module 4: Current Position & Teleport */}
                <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-purple-400" />
                      {t("ext.players.position") || "Current position"}
                    </h4>
                    <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                      {details?.location?.world || "minecraft:overworld"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="coord-box">
                      <div className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider mb-0.5">X Axis</div>
                      <div className="font-mono font-extrabold text-base text-foreground">
                        {details?.location?.x ?? 0}
                      </div>
                    </div>
                    <div className="coord-box">
                      <div className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider mb-0.5">Y Axis (Height)</div>
                      <div className="font-mono font-extrabold text-base text-foreground">
                        {details?.location?.y ?? 64}
                      </div>
                    </div>
                    <div className="coord-box">
                      <div className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider mb-0.5">Z Axis</div>
                      <div className="font-mono font-extrabold text-base text-foreground">
                        {details?.location?.z ?? 0}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTeleport(true)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    {t("ext.players.teleport") || "Teleport"}
                  </button>
                </div>
              </div>
            </div>

            {/* BOTTOM SECTION: FULL WIDTH GAMEPLAY STATISTICS */}
            <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <BarChartIcon className="w-4 h-4 text-cyan-400" />
                  {t("ext.players.stats") || "Gameplay Statistics"}
                </h4>
              </div>

              {/* 4 Metric Top Grid */}
              <div className="mc-stats-grid-4">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-center">
                  <ClockIcon className="w-5 h-5 mx-auto text-cyan-400 mb-1.5" />
                  <div className="text-[11px] text-muted-foreground font-medium">Total Playtime</div>
                  <div className="font-black text-sm text-foreground truncate mt-0.5">
                    {details?.stats?.playtimeText || "0m"}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-center">
                  <SwordsIcon className="w-5 h-5 mx-auto text-rose-400 mb-1.5" />
                  <div className="text-[11px] text-muted-foreground font-medium">Player Kills</div>
                  <div className="font-black text-sm text-foreground mt-0.5">
                    {details?.stats?.playerKills ?? 0}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-center">
                  <SkullIcon className="w-5 h-5 mx-auto text-muted-foreground mb-1.5" />
                  <div className="text-[11px] text-muted-foreground font-medium">Total Deaths</div>
                  <div className="font-black text-sm text-foreground mt-0.5">
                    {details?.stats?.deaths ?? 0}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-center">
                  <GaugeIcon className="w-5 h-5 mx-auto text-amber-400 mb-1.5" />
                  <div className="text-[11px] text-muted-foreground font-medium">Kill / Death Ratio</div>
                  <div className="font-black text-sm text-foreground mt-0.5">
                    {details?.stats?.kdr ?? 0}
                  </div>
                </div>
              </div>

              {/* Detailed Multi-Column Telemetry */}
              <div className="mc-stats-grid-3 pt-2">
                {/* Distance Group */}
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1">
                    <FootprintsIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Travel & Movement</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Total Distance:</span>
                    <span className="font-bold text-foreground">{details?.stats?.distanceTotal ?? 0} blocks</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Distance Sprinted:</span>
                    <span className="font-bold text-foreground">{details?.stats?.distanceSprinted ?? 0} blocks</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Distance Walked:</span>
                    <span className="font-bold text-foreground">{details?.stats?.distanceWalked ?? 0} blocks</span>
                  </div>
                </div>

                {/* World Activity */}
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1">
                    <PickaxeIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mining & Construction</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Blocks Broken:</span>
                    <span className="font-bold text-foreground">{details?.stats?.blocksBroken ?? "No data"}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Items Used:</span>
                    <span className="font-bold text-foreground">{details?.stats?.itemsUsed ?? "No data"}</span>
                  </div>
                </div>

                {/* Combat & Mobs */}
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1">
                    <SwordsIcon className="w-3.5 h-3.5 text-rose-400" />
                    <span>Combat & Hunting</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Entities Killed:</span>
                    <span className="font-bold text-foreground">{details?.stats?.entitiesKilled ?? "No data"}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>K/D Ratio:</span>
                    <span className="font-bold text-foreground">{details?.stats?.kdr ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM SECTION: FULL WIDTH DELETE PLAYER DATA */}
            <div className="p-5 rounded-2xl bg-rose-600/10 border border-rose-500/30 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <TrashIcon className="w-4 h-4" />
                  {t("ext.players.purge_data") || "Delete player data"}
                </h4>
                <span className="text-xs text-rose-400/80">Permanent destructive purge tool</span>
              </div>

              <div className="mc-purge-grid">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/40 cursor-pointer hover:bg-background/80 transition">
                  <input
                    type="checkbox"
                    checked={purgeOptions.experiencePoints}
                    onChange={(e) =>
                      setPurgeOptions((prev: any) => ({
                        ...prev,
                        experiencePoints: e.target.checked,
                      }))
                    }
                    className="rounded text-rose-600"
                  />
                  <span>Experience points</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/40 cursor-pointer hover:bg-background/80 transition">
                  <input
                    type="checkbox"
                    checked={purgeOptions.inventory}
                    onChange={(e) =>
                      setPurgeOptions((prev: any) => ({
                        ...prev,
                        inventory: e.target.checked,
                      }))
                    }
                    className="rounded text-rose-600"
                  />
                  <span>Inventory</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/40 cursor-pointer hover:bg-background/80 transition">
                  <input
                    type="checkbox"
                    checked={purgeOptions.enderChest}
                    onChange={(e) =>
                      setPurgeOptions((prev: any) => ({
                        ...prev,
                        enderChest: e.target.checked,
                      }))
                    }
                    className="rounded text-rose-600"
                  />
                  <span>Ender Chest</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/40 cursor-pointer hover:bg-background/80 transition">
                  <input
                    type="checkbox"
                    checked={purgeOptions.playerDataFile}
                    onChange={(e) =>
                      setPurgeOptions((prev: any) => ({
                        ...prev,
                        playerDataFile: e.target.checked,
                      }))
                    }
                    className="rounded text-rose-600"
                  />
                  <span>Player data file</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/40 cursor-pointer hover:bg-background/80 transition">
                  <input
                    type="checkbox"
                    checked={purgeOptions.statisticsFile}
                    onChange={(e) =>
                      setPurgeOptions((prev: any) => ({
                        ...prev,
                        statisticsFile: e.target.checked,
                      }))
                    }
                    className="rounded text-rose-600"
                  />
                  <span>Statistics file</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/40 cursor-pointer hover:bg-background/80 transition">
                  <input
                    type="checkbox"
                    checked={purgeOptions.advancementsFile}
                    onChange={(e) =>
                      setPurgeOptions((prev: any) => ({
                        ...prev,
                        advancementsFile: e.target.checked,
                      }))
                    }
                    className="rounded text-rose-600"
                  />
                  <span>Advancements file</span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-rose-500/20">
                <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectAllPurge}
                    onChange={(e) => handleToggleSelectAll(e.target.checked)}
                    className="rounded text-rose-600"
                  />
                  <span>Select all categories</span>
                </label>

                <button
                  type="submit"
                  onClick={handleOpenPurgeDialog}
                  disabled={purgeMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  {t("ext.players.confirm_purge") || "Delete player data"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Teleport Modal */}
      {showTeleport && (
        <TeleportModal
          serverId={serverId}
          uuid={uuid}
          username={details?.summary?.username || uuid}
          currentLocation={details?.location}
          onClose={() => setShowTeleport(false)}
          onSuccess={() => detailsQuery.refetch()}
        />
      )}

      {/* Delete Data Confirmation Modal */}
      {showPurgeConfirm && (
        <PurgeConfirmModal
          username={details?.summary?.username || uuid}
          options={purgeOptions}
          onConfirm={() => purgeMutation.mutate(purgeOptions)}
          onCancel={() => setShowPurgeConfirm(false)}
          isPending={purgeMutation.isPending}
        />
      )}
    </div>
  );
};
