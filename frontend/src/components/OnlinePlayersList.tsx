import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

interface OnlinePlayersListProps {
  onlinePlayers: Array<{
    uuid: string;
    username: string;
    isOnline: boolean;
    skinAvatarUrl: string;
  }>;
  isLoading: boolean;
  onSelectPlayer: (uuid: string) => void;
}

export const OnlinePlayersList: React.FC<OnlinePlayersListProps> = ({
  onlinePlayers,
  isLoading,
  onSelectPlayer,
}) => {
  const kubek = typeof window !== "undefined" ? window.Kubek : undefined;
  const icons = kubek?.icons || {};
  const { t } = kubek?.hooks?.useTranslation?.() || { t: (k: string) => k };

  const RefreshIcon = icons.RefreshCw || (() => null);
  const UsersIcon = icons.Users || icons.User || (() => null);
  const ArrowRightIcon = icons.ArrowRight || (() => null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="players-pulse-dot" />
          <h3 className="text-base font-bold text-foreground">
            {t("ext.players.online_players") || "Online Players"}
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {onlinePlayers.length}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <RefreshIcon className="w-5 h-5 animate-spin mr-2" />
          Loading online players...
        </div>
      ) : onlinePlayers.length === 0 ? (
        <div className="p-8 rounded-2xl border border-border/50 bg-card/40 text-center text-muted-foreground text-sm">
          <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-muted-foreground" />
          {t("ext.players.no_players_online") || "No players currently connected to the server."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {onlinePlayers.map((player) => (
            <div
              key={player.uuid || player.username}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border/60 hover:border-primary/50 hover:shadow-md transition group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={player.skinAvatarUrl || `https://mc-heads.net/avatar/${player.username}/40`}
                    alt={player.username}
                    className="w-10 h-10 rounded-xl bg-background shadow-inner object-cover border border-border/40"
                    onError={(e: any) => {
                      e.target.src = "https://mc-heads.net/avatar/MHF_Steve/40";
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 players-pulse-dot border-2 border-card" />
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground group-hover:text-primary transition">
                    {player.username}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium">Online</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectPlayer(player.uuid || player.username)}
                className="w-8 h-8 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white flex items-center justify-center transition shadow-sm border border-blue-500/30"
                title="View player details"
              >
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
