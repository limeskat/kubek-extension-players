import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

interface OfflinePlayersListProps {
  players: Array<{
    uuid: string;
    username: string;
    isOnline: boolean;
    skinAvatarUrl: string;
    lastSeen?: string;
  }>;
  isLoading: boolean;
  onSelectPlayer: (uuid: string) => void;
}

export const OfflinePlayersList: React.FC<OfflinePlayersListProps> = ({
  players,
  isLoading,
  onSelectPlayer,
}) => {
  const kubek = typeof window !== "undefined" ? window.Kubek : undefined;
  const icons = kubek?.icons || {};
  const { t } = kubek?.hooks?.useTranslation?.() || { t: (k: string) => k };

  const [search, setSearch] = useState("");

  const filteredPlayers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return players;
    return players.filter(
      (p) =>
        p.username.toLowerCase().includes(q) ||
        p.uuid.toLowerCase().includes(q),
    );
  }, [players, search]);

  const DatabaseIcon = icons.Database || icons.Box || (() => null);
  const SearchIcon = icons.Search || (() => null);
  const RefreshIcon = icons.RefreshCw || (() => null);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <DatabaseIcon className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-base font-bold text-foreground">
            {t("ext.players.all_players") || "All Players Directory"}
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-muted text-muted-foreground border border-border">
            {players.length}
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search player or UUID..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-card border border-border/80 text-xs focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <RefreshIcon className="w-5 h-5 animate-spin mr-2" />
          Loading directory...
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="p-8 rounded-2xl border border-border/50 bg-card/40 text-center text-muted-foreground text-sm">
          No players match your search filter.
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold">
                <tr>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">UUID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredPlayers.map((player: any) => (
                  <tr
                    key={player.uuid}
                    className="hover:bg-muted/30 transition group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={player.skinAvatarUrl || `https://mc-heads.net/avatar/${player.uuid}/32`}
                          alt={player.username}
                          className="w-8 h-8 rounded-lg bg-background shadow-inner object-cover border border-border/40"
                          onError={(e: any) => {
                            e.target.src = "https://mc-heads.net/avatar/MHF_Steve/32";
                          }}
                        />
                        <span className="font-bold text-foreground group-hover:text-primary transition">
                          {player.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                      {player.uuid}
                    </td>
                    <td className="px-4 py-3">
                      {player.isOnline ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium text-[10px] bg-muted text-muted-foreground">
                          Offline
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectPlayer(player.uuid)}
                        className="px-3 py-1.5 rounded-lg bg-muted/80 hover:bg-primary hover:text-primary-foreground font-semibold transition border border-border/60"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
