import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { CategoryCards } from "./CategoryCards";
import { CategoryListModal } from "./CategoryListModal";
import { OfflinePlayersList } from "./OfflinePlayersList";
import { OnlinePlayersList } from "./OnlinePlayersList";
import { PlayerDetailsModal } from "./PlayerDetailsModal";

export const PlayersDashboard: React.FC = () => {
  const kubek = typeof window !== "undefined" ? window.Kubek : undefined;

  if (!kubek || !kubek.query?.useQuery) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse text-sm">
        Loading Players module...
      </div>
    );
  }

  const { ui, icons, http, query, hooks } = kubek;
  const { t } = hooks?.useTranslation?.() || { t: (k: string) => k };

  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<
    "whitelist" | "ops" | "banned-players" | "banned-ips" | null
  >(null);
  const [selectedPlayerUuid, setSelectedPlayerUuid] = useState<string | null>(null);
  useEffect(() => {
    const patchIcon = () => {
      const elements = document.querySelectorAll('a, button, [role="button"], div, li');
      elements.forEach((el) => {
        const href = el.getAttribute('href') || '';
        const text = (el.textContent || '').trim();
        if (
          href.includes('com.kubek.players') ||
          href.includes('PlayersDashboard') ||
          (text.startsWith('Players') && text.length <= 15)
        ) {
          const svg = el.querySelector('svg');
          if (svg) {
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
            svg.setAttribute('stroke-linecap', 'round');
            svg.setAttribute('stroke-linejoin', 'round');
            svg.innerHTML = '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path>';
          }
        }
      });
    };
    patchIcon();
    const t1 = setTimeout(patchIcon, 50);
    const t2 = setTimeout(patchIcon, 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);


  // Fetch servers list
  const serversQuery = query.useQuery({
    queryKey: ["servers", "list"],
    queryFn: () => http.get<any>("servers"),
  });

  const rawServers = serversQuery.data;
  const servers: Array<{ id: string; name: string; status: string }> = Array.isArray(rawServers)
    ? rawServers
    : rawServers?.servers || [];

  // Initialize selected server from localStorage or first server
  useEffect(() => {
    if (!selectedServerId && servers.length > 0) {
      const saved = typeof window !== "undefined" ? localStorage.getItem("selected_server_id") : null;
      const found = servers.find((s) => s.id === saved);
      if (found) {
        setSelectedServerId(found.id);
      } else {
        setSelectedServerId(servers[0].id);
      }
    }
  }, [servers, selectedServerId]);

  // Fetch Summary for Selected Server
  const summaryQuery = query.useQuery({
    queryKey: ["ext", "players", selectedServerId, "summary"],
    queryFn: () =>
      http.get<any>(`ext/com.kubek.players/servers/${selectedServerId}/summary`),
    enabled: Boolean(selectedServerId),
    refetchInterval: 8000,
  });

  // Fetch Online Players
  const onlineQuery = query.useQuery({
    queryKey: ["ext", "players", selectedServerId, "online"],
    queryFn: () =>
      http.get<any>(`ext/com.kubek.players/servers/${selectedServerId}/online`),
    enabled: Boolean(selectedServerId),
    refetchInterval: 5000,
  });

  // Fetch All Discovered Players Directory
  const directoryQuery = query.useQuery({
    queryKey: ["ext", "players", selectedServerId, "directory"],
    queryFn: () =>
      http.get<any>(`ext/com.kubek.players/servers/${selectedServerId}/directory`),
    enabled: Boolean(selectedServerId),
  });

  const summary = summaryQuery.data || {
    whitelistCount: 0,
    opsCount: 0,
    bannedPlayersCount: 0,
    bannedIpsCount: 0,
  };

  const onlinePlayers = onlineQuery.data?.online || [];
  const allPlayers = directoryQuery.data?.players || [];

  const handleRefreshAll = () => {
    summaryQuery.refetch();
    onlineQuery.refetch();
    directoryQuery.refetch();
  };

  const UsersIcon = icons.Users || icons.User || (() => null);
  const ServerIcon = icons.Server || (() => null);
  const RefreshIcon = icons.RefreshCw || (() => null);

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300"
      style={{ maxWidth: "1280px", marginLeft: "auto", marginRight: "auto" }}
    >
      {/* Top Header & Server Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <UsersIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                {t("ext.players.title") || "Players Management"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t("ext.players.subtitle") ||
                  "Manage server access lists, real-time vitals, inventories, and player data."}
              </p>
            </div>
          </div>
        </div>

        {/* Server Selector & Refresh */}
        <div className="flex items-center gap-3">
          {servers.length > 1 && (
            <div className="flex items-center rounded-xl bg-card border border-border/80 px-3 py-2 shadow-sm">
              <ServerIcon className="w-4 h-4 text-muted-foreground mr-2" />
              <select
                value={selectedServerId}
                onChange={(e) => {
                  setSelectedServerId(e.target.value);
                  localStorage.setItem("selected_server_id", e.target.value);
                }}
                className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
              >
                {servers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={handleRefreshAll}
            className="p-2.5 rounded-xl bg-card hover:bg-muted border border-border/80 text-muted-foreground hover:text-foreground transition shadow-sm"
            title="Refresh telemetry"
          >
            <RefreshIcon
              className={`w-4 h-4 ${onlineQuery.isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {!selectedServerId ? (
        <div className="p-12 rounded-3xl border border-border bg-card/40 text-center text-muted-foreground">
          <ServerIcon className="w-10 h-10 mx-auto mb-3 opacity-40 text-muted-foreground" />
          <h3 className="text-base font-bold text-foreground mb-1">No Server Selected</h3>
          <p className="text-xs text-muted-foreground">
            Please create or select a server to manage its players.
          </p>
        </div>
      ) : (
        <>
          {/* 1. Category Cards Grid */}
          <CategoryCards
            summary={summary}
            onOpenCategory={(cat) => setActiveCategory(cat)}
          />

          {/* 2. Online Players Section */}
          <OnlinePlayersList
            onlinePlayers={onlinePlayers}
            isLoading={onlineQuery.isLoading}
            onSelectPlayer={(uuid) => setSelectedPlayerUuid(uuid)}
          />

          {/* 3. Offline & All Players Directory */}
          <OfflinePlayersList
            players={allPlayers}
            isLoading={directoryQuery.isLoading}
            onSelectPlayer={(uuid) => setSelectedPlayerUuid(uuid)}
          />
        </>
      )}

      {/* Category List Modal (Whitelist, OPs, Bans) */}
      {activeCategory && selectedServerId && (
        <CategoryListModal
          serverId={selectedServerId}
          category={activeCategory}
          onClose={() => setActiveCategory(null)}
          onChanged={() => {
            summaryQuery.refetch();
            directoryQuery.refetch();
          }}
        />
      )}

      {/* Player Details Modal */}
      {selectedPlayerUuid && selectedServerId && (
        <PlayerDetailsModal
          serverId={selectedServerId}
          uuid={selectedPlayerUuid}
          onClose={() => setSelectedPlayerUuid(null)}
          onChanged={() => {
            summaryQuery.refetch();
            onlineQuery.refetch();
            directoryQuery.refetch();
          }}
        />
      )}
    </div>
  );
};
