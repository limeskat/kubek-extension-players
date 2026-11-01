import React from "react";
import { AssetVersionProvider } from "../ui/assets";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { useKubek } from "../ui/kubek";
import { PageHeader } from "../ui/page-header";
import { Panel } from "../ui/panel";
import { Stat, StatStrip } from "../ui/stat-strip";
import { TabBar, type TabItem } from "../ui/tabs";
import { ToastProvider } from "../ui/toast";
import { AllPlayersTab } from "./tabs/AllPlayersTab";
import { PlayerDetailsDialog } from "./player/PlayerDetailsDialog";
import { BansTab } from "./tabs/BansTab";
import { OnlineTab } from "./tabs/OnlineTab";
import { OpsTab } from "./tabs/OpsTab";
import { WhitelistTab } from "./tabs/WhitelistTab";

type TabId = "online" | "all" | "whitelist" | "ops" | "bans";

const PlayersPageInner: React.FC<{ kubek: any }> = ({ kubek }) => {
  const { ui, icons = {}, http, query, hooks } = kubek;
  const { t } = hooks.useTranslation();

  const [selectedServerId, setSelectedServerId] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState<TabId>("online");
  const [selectedPlayerUuid, setSelectedPlayerUuid] = React.useState<string | null>(null);

  // Fetch servers list
  const serversQuery = query.useQuery({
    queryKey: ["servers", "list"],
    queryFn: () => http.get("servers"),
  });

  const rawServers = serversQuery.data;
  const servers: Array<{ id: string; name: string; status: string; variables?: Record<string, unknown> }> = Array.isArray(rawServers)
    ? rawServers
    : rawServers?.servers || [];

  // Restore the last server, otherwise pick the first one
  React.useEffect(() => {
    if (!selectedServerId && servers.length > 0) {
      const saved =
        typeof window !== "undefined" ? localStorage.getItem("selected_server_id") : null;
      const found = servers.find((server) => server.id === saved);
      setSelectedServerId(found ? found.id : servers[0].id);
    }
  }, [servers, selectedServerId]);

  const summaryQuery = query.useQuery({
    queryKey: ["ext", "players", selectedServerId, "summary"],
    queryFn: () => http.get(`ext/com.kubek.players/servers/${selectedServerId}/summary`),
    enabled: Boolean(selectedServerId),
    refetchInterval: 8000,
  });

  const onlineQuery = query.useQuery({
    queryKey: ["ext", "players", selectedServerId, "online"],
    queryFn: () => http.get(`ext/com.kubek.players/servers/${selectedServerId}/online`),
    enabled: Boolean(selectedServerId),
    refetchInterval: 5000,
  });

  const directoryQuery = query.useQuery({
    queryKey: ["ext", "players", selectedServerId, "directory"],
    queryFn: () => http.get(`ext/com.kubek.players/servers/${selectedServerId}/directory`),
    enabled: Boolean(selectedServerId),
  });

  const summary = summaryQuery.data || {
    whitelistCount: 0,
    opsCount: 0,
    bannedPlayersCount: 0,
    bannedIpsCount: 0,
  };

  const selectedServer = servers.find((server) => server.id === selectedServerId);
  const gameVersion = String(selectedServer?.variables?.GAME_VERSION ?? "").replace(/^v/, "");

  const onlinePlayers: any[] = onlineQuery.data?.online || [];
  const allPlayers: any[] = directoryQuery.data?.players || [];

  const refreshLists = React.useCallback(() => {
    void summaryQuery.refetch();
    void directoryQuery.refetch();
  }, [summaryQuery, directoryQuery]);

  const refreshAll = React.useCallback(() => {
    void serversQuery.refetch();
    void summaryQuery.refetch();
    void onlineQuery.refetch();
    void directoryQuery.refetch();
  }, [serversQuery, summaryQuery, onlineQuery, directoryQuery]);

  const icon = (name: string) => icons[name] || (() => null);
  const RefreshIcon = icon("RefreshCw");
  const ServerIcon = icon("Server");
  const UsersIcon = icon("Users");
  const RadioIcon = icon("Radio");
  const ListChecksIcon = icon("ListChecks");
  const CrownIcon = icon("Crown");
  const BanIcon = icon("Ban");

  const tabs: TabItem[] = [
    { id: "online", label: t("ext.players.tab_online"), icon: <RadioIcon />, count: onlinePlayers.length },
    { id: "all", label: t("ext.players.tab_all"), icon: <UsersIcon />, count: allPlayers.length },
    { id: "whitelist", label: t("ext.players.whitelist"), icon: <ListChecksIcon />, count: summary.whitelistCount },
    { id: "ops", label: t("ext.players.ops"), icon: <CrownIcon />, count: summary.opsCount },
    { id: "bans", label: t("ext.players.tab_bans"), icon: <BanIcon />, count: summary.bannedPlayersCount },
  ];

  const selectServer = (id: string) => {
    setSelectedServerId(id);
    if (typeof window !== "undefined") localStorage.setItem("selected_server_id", id);
  };

  return (
    <AssetVersionProvider version={gameVersion}>
      <div className="k-page">
      <PageHeader
        title={t("ext.players.title") || "Players"}
        description={t("ext.players.subtitle")}
        actions={
          <>
            {servers.length > 1 ? (
              <label className="k-select-wrap">
                <ServerIcon className="k-select-icon" />
                <select
                  className="k-select"
                  value={selectedServerId}
                  onChange={(event) => selectServer(event.target.value)}
                  aria-label={t("ext.players.select_server")}
                >
                  {servers.map((server) => (
                    <option key={server.id} value={server.id}>
                      {server.name} ({server.status})
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <ui.Button
              variant="outline"
              size="icon"
              onClick={refreshAll}
              title={t("ext.players.refresh")}
              aria-label={t("ext.players.refresh")}
            >
              <RefreshIcon className={onlineQuery.isFetching ? "k-spin" : undefined} />
            </ui.Button>
          </>
        }
      />

      {!selectedServerId ? (
        <Panel>
          <Empty>
            <EmptyHeader>
              <EmptyMedia icon={<ServerIcon />} />
              <EmptyTitle>{t("ext.players.no_server")}</EmptyTitle>
              <EmptyDescription>{t("ext.players.no_server_hint")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </Panel>
      ) : (
        <>
          <StatStrip>
            <Stat
              label={t("ext.players.online")}
              value={onlinePlayers.length}
              icon={<RadioIcon />}
              tone="green"
              onClick={() => setActiveTab("online")}
            />
            <Stat
              label={t("ext.players.whitelist")}
              value={summary.whitelistCount}
              icon={<ListChecksIcon />}
              tone="blue"
              onClick={() => setActiveTab("whitelist")}
            />
            <Stat
              label={t("ext.players.ops")}
              value={summary.opsCount}
              icon={<CrownIcon />}
              tone="amber"
              onClick={() => setActiveTab("ops")}
            />
            <Stat
              label={t("ext.players.banned_players")}
              value={summary.bannedPlayersCount}
              icon={<BanIcon />}
              tone="red"
              unit={
                summary.bannedIpsCount
                  ? `· ${summary.bannedIpsCount} IP`
                  : undefined
              }
              onClick={() => setActiveTab("bans")}
            />
          </StatStrip>

          <TabBar
            items={tabs}
            value={activeTab}
            onChange={(id) => setActiveTab(id as TabId)}
            label={t("ext.players.tab_lists")}
          />

          {activeTab === "online" ? (
            <OnlineTab
              players={onlinePlayers}
              isLoading={onlineQuery.isLoading}
              emptyIcon={<UsersIcon />}
              onSelectPlayer={setSelectedPlayerUuid}
            />
          ) : activeTab === "all" ? (
            <AllPlayersTab
              players={allPlayers}
              isLoading={directoryQuery.isLoading}
              emptyIcon={<UsersIcon />}
              onSelectPlayer={setSelectedPlayerUuid}
            />
          ) : activeTab === "whitelist" ? (
            <WhitelistTab serverId={selectedServerId} onChanged={refreshLists} />
          ) : activeTab === "ops" ? (
            <OpsTab serverId={selectedServerId} onChanged={refreshLists} />
          ) : (
            <BansTab serverId={selectedServerId} onChanged={refreshLists} />
          )}
        </>
      )}

        {selectedPlayerUuid && selectedServerId ? (
          <PlayerDetailsDialog
            serverId={selectedServerId}
            uuid={selectedPlayerUuid}
            onClose={() => setSelectedPlayerUuid(null)}
            onChanged={() => {
              refreshLists();
              void onlineQuery.refetch();
            }}
          />
        ) : null}
      </div>
    </AssetVersionProvider>
  );
};

const PlayersPage: React.FC = () => {
  const kubek = useKubek();

  // No hooks may run before this guard; the inner page owns every query hook.
  if (!kubek?.query?.useQuery) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse text-sm">
        Loading Players module...
      </div>
    );
  }

  return <PlayersPageInner kubek={kubek} />;
};

export const PlayersDashboard: React.FC = () => (
  <ToastProvider>
    <PlayersPage />
  </ToastProvider>
);
