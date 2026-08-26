import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

interface CategoryCardsProps {
  summary: {
    whitelistCount: number;
    opsCount: number;
    bannedPlayersCount: number;
    bannedIpsCount: number;
  };
  onOpenCategory: (category: "whitelist" | "ops" | "banned-players" | "banned-ips") => void;
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({
  summary,
  onOpenCategory,
}) => {
  const kubek = typeof window !== "undefined" ? window.Kubek : undefined;
  const icons = kubek?.icons || {};
  const { t } = kubek?.hooks?.useTranslation?.() || { t: (k: string) => k };

  const UserCheckIcon = icons.UserCheck || icons.Users || icons.User || (() => null);
  const CrownIcon = icons.Crown || icons.Shield || (() => null);
  const UserXIcon = icons.UserX || icons.Users || icons.User || (() => null);
  const GlobeIcon = icons.Globe || icons.Crosshair || (() => null);

  const cards = [
    {
      id: "whitelist" as const,
      label: t("ext.players.whitelist") || "Whitelist",
      count: summary.whitelistCount,
      icon: UserCheckIcon,
      bgClass: "bg-blue-600/15 hover:bg-blue-600/25 border-blue-500/30 text-blue-400",
      accentBg: "bg-blue-600",
    },
    {
      id: "ops" as const,
      label: t("ext.players.ops") || "OPs",
      count: summary.opsCount,
      icon: CrownIcon,
      bgClass: "bg-blue-600/15 hover:bg-blue-600/25 border-blue-500/30 text-blue-400",
      accentBg: "bg-blue-600",
    },
    {
      id: "banned-players" as const,
      label: t("ext.players.banned_players") || "Banned players",
      count: summary.bannedPlayersCount,
      icon: UserXIcon,
      bgClass: "bg-rose-600/15 hover:bg-rose-600/25 border-rose-500/30 text-rose-400",
      accentBg: "bg-rose-600",
    },
    {
      id: "banned-ips" as const,
      label: t("ext.players.banned_ips") || "Banned IPs",
      count: summary.bannedIpsCount,
      icon: GlobeIcon,
      bgClass: "bg-rose-600/15 hover:bg-rose-600/25 border-rose-500/30 text-rose-400",
      accentBg: "bg-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onOpenCategory(card.id)}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-left shadow-sm ${card.bgClass}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg text-white ${card.accentBg} shadow-md`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">{card.label}</h4>
                <p className="text-xs text-muted-foreground">
                  {card.count} {card.count === 1 ? "entry" : "entries"}
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-bold px-2 py-1 rounded-md bg-background/50 border border-border/40">
              Manage
            </div>
          </button>
        );
      })}
    </div>
  );
};
