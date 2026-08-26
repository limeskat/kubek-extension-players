// react-shim:react
var React = typeof window !== "undefined" && window.Kubek?.React || typeof window !== "undefined" && window.React || {};
var react_default = React;
var {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useContext,
  createContext,
  createElement,
  Fragment,
  forwardRef,
  memo,
  useId,
  useLayoutEffect,
  useTransition,
  useDeferredValue,
  Children,
  cloneElement,
  isValidElement
} = React;

// frontend/src/components/CategoryCards.tsx
var CategoryCards = ({
  summary,
  onOpenCategory
}) => {
  const kubek = typeof window !== "undefined" ? window.Kubek : void 0;
  const icons = kubek?.icons || {};
  const { t } = kubek?.hooks?.useTranslation?.() || { t: (k) => k };
  const UserCheckIcon = icons.UserCheck || icons.Users || icons.User || (() => null);
  const CrownIcon = icons.Crown || icons.Shield || (() => null);
  const UserXIcon = icons.UserX || icons.Users || icons.User || (() => null);
  const GlobeIcon = icons.Globe || icons.Crosshair || (() => null);
  const cards = [
    {
      id: "whitelist",
      label: t("ext.players.whitelist") || "Whitelist",
      count: summary.whitelistCount,
      icon: UserCheckIcon,
      bgClass: "bg-blue-600/15 hover:bg-blue-600/25 border-blue-500/30 text-blue-400",
      accentBg: "bg-blue-600"
    },
    {
      id: "ops",
      label: t("ext.players.ops") || "OPs",
      count: summary.opsCount,
      icon: CrownIcon,
      bgClass: "bg-blue-600/15 hover:bg-blue-600/25 border-blue-500/30 text-blue-400",
      accentBg: "bg-blue-600"
    },
    {
      id: "banned-players",
      label: t("ext.players.banned_players") || "Banned players",
      count: summary.bannedPlayersCount,
      icon: UserXIcon,
      bgClass: "bg-rose-600/15 hover:bg-rose-600/25 border-rose-500/30 text-rose-400",
      accentBg: "bg-rose-600"
    },
    {
      id: "banned-ips",
      label: t("ext.players.banned_ips") || "Banned IPs",
      count: summary.bannedIpsCount,
      icon: GlobeIcon,
      bgClass: "bg-rose-600/15 hover:bg-rose-600/25 border-rose-500/30 text-rose-400",
      accentBg: "bg-rose-600"
    }
  ];
  return /* @__PURE__ */ react_default.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" }, cards.map((card) => {
    const IconComponent = card.icon;
    return /* @__PURE__ */ react_default.createElement(
      "button",
      {
        key: card.id,
        type: "button",
        onClick: () => onOpenCategory(card.id),
        className: `flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-left shadow-sm ${card.bgClass}`
      },
      /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ react_default.createElement("div", { className: `p-2.5 rounded-lg text-white ${card.accentBg} shadow-md` }, /* @__PURE__ */ react_default.createElement(IconComponent, { className: "w-5 h-5" })), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("h4", { className: "font-semibold text-sm text-foreground" }, card.label), /* @__PURE__ */ react_default.createElement("p", { className: "text-xs text-muted-foreground" }, card.count, " ", card.count === 1 ? "entry" : "entries"))),
      /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center text-xs font-bold px-2 py-1 rounded-md bg-background/50 border border-border/40" }, "Manage")
    );
  }));
};

// frontend/src/components/CategoryListModal.tsx
var CategoryListModal = ({
  serverId,
  category,
  onClose,
  onChanged
}) => {
  const kubek = typeof window !== "undefined" ? window.Kubek : void 0;
  if (!kubek || !category) return null;
  const { ui, icons = {}, http, query, hooks } = kubek;
  const { t } = hooks?.useTranslation?.() || { t: (k) => k };
  const [inputValue, setInputValue] = useState("");
  const [reasonValue, setReasonValue] = useState("");
  const isIp = category === "banned-ips";
  const isBan = category === "banned-players" || category === "banned-ips";
  const titles = {
    whitelist: t("ext.players.whitelist") || "Whitelist",
    ops: t("ext.players.ops") || "Operators (OPs)",
    "banned-players": t("ext.players.banned_players") || "Banned Players",
    "banned-ips": t("ext.players.banned_ips") || "Banned IP Addresses"
  };
  const placeholders = {
    whitelist: t("ext.players.placeholder_player") || "Player username (e.g. deiwos)",
    ops: t("ext.players.placeholder_player") || "Player username (e.g. deiwos)",
    "banned-players": t("ext.players.placeholder_player") || "Player username (e.g. deiwos)",
    "banned-ips": t("ext.players.placeholder_ip") || "IP address (e.g. 192.168.1.1)"
  };
  const listQuery = query.useQuery({
    queryKey: ["ext", "players", serverId, "list", category],
    queryFn: () => http.get(`ext/com.kubek.players/servers/${serverId}/lists/${category}`)
  });
  const addMutation = query.useMutation({
    mutationFn: (body) => http.post(`ext/com.kubek.players/servers/${serverId}/lists/${category}`, body),
    onSuccess: () => {
      setInputValue("");
      setReasonValue("");
      listQuery.refetch();
      onChanged();
    }
  });
  const deleteMutation = query.useMutation({
    mutationFn: (identifier) => http.delete(
      `ext/com.kubek.players/servers/${serverId}/lists/${category}/${encodeURIComponent(identifier)}`
    ),
    onSuccess: () => {
      listQuery.refetch();
      onChanged();
    }
  });
  const handleAdd = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    addMutation.mutate({
      name: inputValue.trim(),
      ip: inputValue.trim(),
      reason: reasonValue.trim() || void 0
    });
  };
  const entries = listQuery.data?.entries || [];
  const UserXIcon = icons.UserX || icons.Users || (() => null);
  const UsersIcon = icons.Users || icons.User || (() => null);
  const XIcon = icons.X || (() => null);
  const RefreshIcon = icons.RefreshCw || (() => null);
  const GlobeIcon = icons.Globe || (() => null);
  const TrashIcon = icons.Trash2 || (() => null);
  const PlusIcon = icons.Plus || (() => null);
  return /* @__PURE__ */ react_default.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200" }, /* @__PURE__ */ react_default.createElement("div", { className: "bg-card border border-border/80 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/30" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ react_default.createElement("div", { className: `p-2 rounded-lg text-white ${isBan ? "bg-rose-600" : "bg-blue-600"}` }, isBan ? /* @__PURE__ */ react_default.createElement(UserXIcon, { className: "w-5 h-5" }) : /* @__PURE__ */ react_default.createElement(UsersIcon, { className: "w-5 h-5" })), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("h3", { className: "font-bold text-lg text-foreground" }, titles[category]), /* @__PURE__ */ react_default.createElement("p", { className: "text-xs text-muted-foreground" }, entries.length, " ", entries.length === 1 ? "entry" : "entries", " recorded"))), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: onClose,
      className: "p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
    },
    /* @__PURE__ */ react_default.createElement(XIcon, { className: "w-5 h-5" })
  )), /* @__PURE__ */ react_default.createElement("div", { className: "p-6 overflow-y-auto flex-1 space-y-2.5" }, listQuery.isLoading ? /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center justify-center py-12 text-muted-foreground" }, /* @__PURE__ */ react_default.createElement(RefreshIcon, { className: "w-6 h-6 animate-spin" })) : entries.length === 0 ? /* @__PURE__ */ react_default.createElement("div", { className: "text-center py-12 text-muted-foreground text-sm" }, /* @__PURE__ */ react_default.createElement(UsersIcon, { className: "w-8 h-8 mx-auto mb-2 opacity-40" }), t("ext.players.no_entries") || "No entries found in this list.") : entries.map((entry, index) => {
    const nameOrIp = entry.name || entry.ip || entry.uuid;
    const avatarUrl = entry.avatarUrl;
    return /* @__PURE__ */ react_default.createElement(
      "div",
      {
        key: entry.uuid || entry.ip || entry.name || index,
        className: "flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/40 transition"
      },
      /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-3" }, isIp ? /* @__PURE__ */ react_default.createElement("div", { className: "w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-mono text-xs font-bold" }, /* @__PURE__ */ react_default.createElement(GlobeIcon, { className: "w-4 h-4" })) : /* @__PURE__ */ react_default.createElement(
        "img",
        {
          src: avatarUrl || `https://crafatar.com/avatars/${nameOrIp}?size=36`,
          alt: nameOrIp,
          className: "w-9 h-9 rounded-lg shadow-inner bg-background object-cover",
          onError: (e) => {
            e.target.src = "https://crafatar.com/avatars/steve?size=36";
          }
        }
      ), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { className: "font-semibold text-sm text-foreground" }, nameOrIp), entry.reason && /* @__PURE__ */ react_default.createElement("div", { className: "text-xs text-muted-foreground line-clamp-1" }, "Reason: ", entry.reason))),
      /* @__PURE__ */ react_default.createElement(
        "button",
        {
          type: "button",
          onClick: () => deleteMutation.mutate(nameOrIp),
          disabled: deleteMutation.isPending,
          className: "p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 transition shadow-sm",
          title: "Remove from list"
        },
        /* @__PURE__ */ react_default.createElement(TrashIcon, { className: "w-4 h-4" })
      )
    );
  })), /* @__PURE__ */ react_default.createElement(
    "form",
    {
      onSubmit: handleAdd,
      className: "p-4 border-t border-border/50 bg-muted/20 flex flex-col sm:flex-row gap-2"
    },
    /* @__PURE__ */ react_default.createElement(
      "input",
      {
        type: "text",
        value: inputValue,
        onChange: (e) => setInputValue(e.target.value),
        placeholder: placeholders[category],
        className: "flex-1 px-3.5 py-2.5 rounded-xl bg-background border border-border/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
      }
    ),
    isBan && /* @__PURE__ */ react_default.createElement(
      "input",
      {
        type: "text",
        value: reasonValue,
        onChange: (e) => setReasonValue(e.target.value),
        placeholder: "Ban Reason (optional)",
        className: "sm:w-44 px-3 py-2.5 rounded-xl bg-background border border-border/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
      }
    ),
    /* @__PURE__ */ react_default.createElement(
      "button",
      {
        type: "submit",
        disabled: !inputValue.trim() || addMutation.isPending,
        className: "px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5"
      },
      /* @__PURE__ */ react_default.createElement(PlusIcon, { className: "w-4 h-4" }),
      t("ext.players.add_entry") || "+ Add"
    )
  )));
};

// frontend/src/components/OfflinePlayersList.tsx
var OfflinePlayersList = ({
  players,
  isLoading,
  onSelectPlayer
}) => {
  const kubek = typeof window !== "undefined" ? window.Kubek : void 0;
  const icons = kubek?.icons || {};
  const { t } = kubek?.hooks?.useTranslation?.() || { t: (k) => k };
  const [search, setSearch] = useState("");
  const filteredPlayers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return players;
    return players.filter(
      (p) => p.username.toLowerCase().includes(q) || p.uuid.toLowerCase().includes(q)
    );
  }, [players, search]);
  const DatabaseIcon = icons.Database || icons.Box || (() => null);
  const SearchIcon = icons.Search || (() => null);
  const RefreshIcon = icons.RefreshCw || (() => null);
  return /* @__PURE__ */ react_default.createElement("div", { className: "space-y-4 pt-2" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_default.createElement(DatabaseIcon, { className: "w-4 h-4 text-muted-foreground" }), /* @__PURE__ */ react_default.createElement("h3", { className: "text-base font-bold text-foreground" }, t("ext.players.all_players") || "All Players Directory"), /* @__PURE__ */ react_default.createElement("span", { className: "text-xs px-2 py-0.5 rounded-full font-bold bg-muted text-muted-foreground border border-border" }, players.length)), /* @__PURE__ */ react_default.createElement("div", { className: "relative w-full sm:w-64" }, /* @__PURE__ */ react_default.createElement(SearchIcon, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "text",
      value: search,
      onChange: (e) => setSearch(e.target.value),
      placeholder: "Search player or UUID...",
      className: "w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-card border border-border/80 text-xs focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
    }
  ))), isLoading ? /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center justify-center p-8 text-muted-foreground" }, /* @__PURE__ */ react_default.createElement(RefreshIcon, { className: "w-5 h-5 animate-spin mr-2" }), "Loading directory...") : filteredPlayers.length === 0 ? /* @__PURE__ */ react_default.createElement("div", { className: "p-8 rounded-2xl border border-border/50 bg-card/40 text-center text-muted-foreground text-sm" }, "No players match your search filter.") : /* @__PURE__ */ react_default.createElement("div", { className: "rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm" }, /* @__PURE__ */ react_default.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ react_default.createElement("table", { className: "w-full text-left text-xs" }, /* @__PURE__ */ react_default.createElement("thead", { className: "bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold" }, /* @__PURE__ */ react_default.createElement("tr", null, /* @__PURE__ */ react_default.createElement("th", { className: "px-4 py-3" }, "Player"), /* @__PURE__ */ react_default.createElement("th", { className: "px-4 py-3" }, "UUID"), /* @__PURE__ */ react_default.createElement("th", { className: "px-4 py-3" }, "Status"), /* @__PURE__ */ react_default.createElement("th", { className: "px-4 py-3 text-right" }, "Actions"))), /* @__PURE__ */ react_default.createElement("tbody", { className: "divide-y divide-border/40" }, filteredPlayers.map((player) => /* @__PURE__ */ react_default.createElement(
    "tr",
    {
      key: player.uuid,
      className: "hover:bg-muted/30 transition group"
    },
    /* @__PURE__ */ react_default.createElement("td", { className: "px-4 py-3" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ react_default.createElement(
      "img",
      {
        src: player.skinAvatarUrl || `https://crafatar.com/avatars/${player.uuid}?size=32`,
        alt: player.username,
        className: "w-8 h-8 rounded-lg bg-background shadow-inner object-cover border border-border/40",
        onError: (e) => {
          e.target.src = "https://crafatar.com/avatars/steve?size=32";
        }
      }
    ), /* @__PURE__ */ react_default.createElement("span", { className: "font-bold text-foreground group-hover:text-primary transition" }, player.username))),
    /* @__PURE__ */ react_default.createElement("td", { className: "px-4 py-3 font-mono text-[11px] text-muted-foreground" }, player.uuid),
    /* @__PURE__ */ react_default.createElement("td", { className: "px-4 py-3" }, player.isOnline ? /* @__PURE__ */ react_default.createElement("span", { className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" }, /* @__PURE__ */ react_default.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400" }), "Online") : /* @__PURE__ */ react_default.createElement("span", { className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium text-[10px] bg-muted text-muted-foreground" }, "Offline")),
    /* @__PURE__ */ react_default.createElement("td", { className: "px-4 py-3 text-right" }, /* @__PURE__ */ react_default.createElement(
      "button",
      {
        type: "button",
        onClick: () => onSelectPlayer(player.uuid),
        className: "px-3 py-1.5 rounded-lg bg-muted/80 hover:bg-primary hover:text-primary-foreground font-semibold transition border border-border/60"
      },
      "Inspect"
    ))
  )))))));
};

// frontend/src/components/OnlinePlayersList.tsx
var OnlinePlayersList = ({
  onlinePlayers,
  isLoading,
  onSelectPlayer
}) => {
  const kubek = typeof window !== "undefined" ? window.Kubek : void 0;
  const icons = kubek?.icons || {};
  const { t } = kubek?.hooks?.useTranslation?.() || { t: (k) => k };
  const RefreshIcon = icons.RefreshCw || (() => null);
  const UsersIcon = icons.Users || icons.User || (() => null);
  const ArrowRightIcon = icons.ArrowRight || (() => null);
  return /* @__PURE__ */ react_default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_default.createElement("div", { className: "players-pulse-dot" }), /* @__PURE__ */ react_default.createElement("h3", { className: "text-base font-bold text-foreground" }, t("ext.players.online_players") || "Online Players"), /* @__PURE__ */ react_default.createElement("span", { className: "text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" }, onlinePlayers.length))), isLoading ? /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center justify-center p-8 text-muted-foreground" }, /* @__PURE__ */ react_default.createElement(RefreshIcon, { className: "w-5 h-5 animate-spin mr-2" }), "Loading online players...") : onlinePlayers.length === 0 ? /* @__PURE__ */ react_default.createElement("div", { className: "p-8 rounded-2xl border border-border/50 bg-card/40 text-center text-muted-foreground text-sm" }, /* @__PURE__ */ react_default.createElement(UsersIcon, { className: "w-8 h-8 mx-auto mb-2 opacity-40 text-muted-foreground" }), t("ext.players.no_players_online") || "No players currently connected to the server.") : /* @__PURE__ */ react_default.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5" }, onlinePlayers.map((player) => /* @__PURE__ */ react_default.createElement(
    "div",
    {
      key: player.uuid || player.username,
      className: "flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border/60 hover:border-primary/50 hover:shadow-md transition group"
    },
    /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ react_default.createElement("div", { className: "relative" }, /* @__PURE__ */ react_default.createElement(
      "img",
      {
        src: player.skinAvatarUrl || `https://crafatar.com/avatars/${player.username}?size=40`,
        alt: player.username,
        className: "w-10 h-10 rounded-xl bg-background shadow-inner object-cover border border-border/40",
        onError: (e) => {
          e.target.src = "https://crafatar.com/avatars/steve?size=40";
        }
      }
    ), /* @__PURE__ */ react_default.createElement("div", { className: "absolute -bottom-1 -right-1 players-pulse-dot border-2 border-card" })), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { className: "font-bold text-sm text-foreground group-hover:text-primary transition" }, player.username), /* @__PURE__ */ react_default.createElement("div", { className: "text-[11px] text-emerald-400 font-medium" }, "Online"))),
    /* @__PURE__ */ react_default.createElement(
      "button",
      {
        type: "button",
        onClick: () => onSelectPlayer(player.uuid || player.username),
        className: "w-8 h-8 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white flex items-center justify-center transition shadow-sm border border-blue-500/30",
        title: "View player details"
      },
      /* @__PURE__ */ react_default.createElement(ArrowRightIcon, { className: "w-4 h-4" })
    )
  ))));
};

// frontend/src/components/MinecraftIcons.tsx
var SLOT_HELMET_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAANUlEQVQ4y2NgGJ4gNDT0PzZMtGZy5IhTQEjN4DEAPdCQ+bR1AcWxQBUDcCkkWjOu1Dh48w0AYJ4/wa1cA24AAAAASUVORK5CYII=";
var SLOT_CHESTPLATE_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAN0lEQVQ4y2NgGHQgNDT0Pz5MUCOxFmAIkuPSQWQAqYZgVUuxAcQaQjAqh7gBhBQQHdAk5wNKAAAxZUu1bTG8GwAAAABJRU5ErkJggg==";
var SLOT_LEGGINGS_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAALUlEQVQ4y2NgGHQgNDT0Pz5MUDMxFgwhA7D5m2gDiGGPGjBoDcCW7knKD6QCAJIMa5WmTdLCAAAAAElFTkSuQmCC";
var SLOT_BOOTS_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAANklEQVQ4y2NgGH4gNDT0PwzjE8OpmRT2qAF4NBPShGEINlMJ2YoiRtAGQmqQEwq+QCJW3RADAHiLW6VtnlyIAAAAAElFTkSuQmCC";
var SLOT_SHIELD_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAADFBMVEX///8ZICIAAABVVVXvAVy1AAAAA3RSTlMAAAD6dsTeAAAASUlEQVR42mNYBQQMDcwXmBhW/bFfxdC/MuoTw7ZVq/oYtoKIuatWbYMQa0HE6lWrXkGJLCCx8tbqLIaVtXuzGFaFXwUSq1atAgA2yCiNNcLDCQAAAABJRU5ErkJggg==";
var SlotHelmetIcon = ({ className = "w-8 h-8" }) => /* @__PURE__ */ react_default.createElement(
  "img",
  {
    src: SLOT_HELMET_B64,
    alt: "Helmet Slot",
    className: `${className} image-pixelated pointer-events-none select-none`,
    style: { imageRendering: "pixelated", width: "36px", height: "36px" }
  }
);
var SlotChestplateIcon = ({ className = "w-8 h-8" }) => /* @__PURE__ */ react_default.createElement(
  "img",
  {
    src: SLOT_CHESTPLATE_B64,
    alt: "Chestplate Slot",
    className: `${className} image-pixelated pointer-events-none select-none`,
    style: { imageRendering: "pixelated", width: "36px", height: "36px" }
  }
);
var SlotLeggingsIcon = ({ className = "w-8 h-8" }) => /* @__PURE__ */ react_default.createElement(
  "img",
  {
    src: SLOT_LEGGINGS_B64,
    alt: "Leggings Slot",
    className: `${className} image-pixelated pointer-events-none select-none`,
    style: { imageRendering: "pixelated", width: "36px", height: "36px" }
  }
);
var SlotBootsIcon = ({ className = "w-8 h-8" }) => /* @__PURE__ */ react_default.createElement(
  "img",
  {
    src: SLOT_BOOTS_B64,
    alt: "Boots Slot",
    className: `${className} image-pixelated pointer-events-none select-none`,
    style: { imageRendering: "pixelated", width: "36px", height: "36px" }
  }
);
var SlotShieldIcon = ({ className = "w-8 h-8" }) => /* @__PURE__ */ react_default.createElement(
  "img",
  {
    src: SLOT_SHIELD_B64,
    alt: "Shield Slot",
    className: `${className} image-pixelated pointer-events-none select-none`,
    style: { imageRendering: "pixelated", width: "36px", height: "36px" }
  }
);
var MinecraftHeart = ({
  type,
  className = "w-5 h-5"
}) => {
  const heartPath = "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
  if (type === "full") {
    return /* @__PURE__ */ react_default.createElement("svg", { viewBox: "0 0 24 24", className, fill: "#f43f5e", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ react_default.createElement("path", { d: heartPath }));
  }
  if (type === "half") {
    return /* @__PURE__ */ react_default.createElement("svg", { viewBox: "0 0 24 24", className, xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ react_default.createElement("defs", null, /* @__PURE__ */ react_default.createElement("clipPath", { id: "heart-left-half" }, /* @__PURE__ */ react_default.createElement("rect", { x: "0", y: "0", width: "12", height: "24" }))), /* @__PURE__ */ react_default.createElement("path", { d: heartPath, fill: "#27272a", stroke: "#3f3f46", strokeWidth: "0.5" }), /* @__PURE__ */ react_default.createElement("path", { d: heartPath, fill: "#f43f5e", clipPath: "url(#heart-left-half)" }));
  }
  return /* @__PURE__ */ react_default.createElement("svg", { viewBox: "0 0 24 24", className, fill: "#27272a", stroke: "#3f3f46", strokeWidth: "1", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ react_default.createElement("path", { d: heartPath }));
};
var MinecraftFood = ({
  type,
  className = "w-5 h-5"
}) => {
  const bonePath = "M4.5 19.5L8.5 15.5L10 17L6 21Z";
  const meatPath = "M8.5 15.2C7.2 13.6 7 11.2 8.2 9C9.5 6.4 12.2 3.8 15.8 3.2C19.2 2.6 22 4.8 22.5 8C23 11.2 20.8 15.2 18 17.5C15.5 19.5 12.8 19.2 11 17.5L8.5 15.2Z";
  if (type === "full") {
    return /* @__PURE__ */ react_default.createElement("svg", { viewBox: "0 0 24 24", className, fill: "none", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ react_default.createElement("path", { d: bonePath, fill: "#ffffff" }), /* @__PURE__ */ react_default.createElement("circle", { cx: "4.2", cy: "18.5", r: "2.2", fill: "#ffffff" }), /* @__PURE__ */ react_default.createElement("circle", { cx: "6.5", cy: "20.8", r: "2.2", fill: "#ffffff" }), /* @__PURE__ */ react_default.createElement("path", { d: meatPath, fill: "#f97316" }));
  }
  if (type === "half") {
    return /* @__PURE__ */ react_default.createElement("svg", { viewBox: "0 0 24 24", className, fill: "none", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ react_default.createElement("defs", null, /* @__PURE__ */ react_default.createElement("clipPath", { id: "drumstick-left-cut" }, /* @__PURE__ */ react_default.createElement("rect", { x: "0", y: "0", width: "13", height: "24" }))), /* @__PURE__ */ react_default.createElement("path", { d: bonePath, fill: "#475569" }), /* @__PURE__ */ react_default.createElement("circle", { cx: "4.2", cy: "18.5", r: "2.2", fill: "#475569" }), /* @__PURE__ */ react_default.createElement("circle", { cx: "6.5", cy: "20.8", r: "2.2", fill: "#475569" }), /* @__PURE__ */ react_default.createElement("path", { d: meatPath, fill: "#27272a", stroke: "#3f3f46", strokeWidth: "0.5" }), /* @__PURE__ */ react_default.createElement("g", { clipPath: "url(#drumstick-left-cut)" }, /* @__PURE__ */ react_default.createElement("path", { d: bonePath, fill: "#ffffff" }), /* @__PURE__ */ react_default.createElement("circle", { cx: "4.2", cy: "18.5", r: "2.2", fill: "#ffffff" }), /* @__PURE__ */ react_default.createElement("circle", { cx: "6.5", cy: "20.8", r: "2.2", fill: "#ffffff" }), /* @__PURE__ */ react_default.createElement("path", { d: meatPath, fill: "#f97316" })));
  }
  return /* @__PURE__ */ react_default.createElement("svg", { viewBox: "0 0 24 24", className, fill: "none", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ react_default.createElement("path", { d: bonePath, fill: "#3f3f46" }), /* @__PURE__ */ react_default.createElement("circle", { cx: "4.2", cy: "18.5", r: "2.2", fill: "#3f3f46" }), /* @__PURE__ */ react_default.createElement("circle", { cx: "6.5", cy: "20.8", r: "2.2", fill: "#3f3f46" }), /* @__PURE__ */ react_default.createElement("path", { d: meatPath, fill: "#27272a", stroke: "#3f3f46", strokeWidth: "0.8" }));
};

// frontend/src/components/GamemodeSelect.tsx
var GamemodeSelect = ({
  value,
  onChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const kubek = typeof window !== "undefined" ? window.Kubek : void 0;
  const icons = kubek?.icons || {};
  const GamepadIcon = icons.Gamepad2 || icons.Gamepad || (() => null);
  const HeartIcon = icons.Heart || (() => null);
  const SparklesIcon = icons.Sparkles || (() => null);
  const CompassIcon = icons.Compass || (() => null);
  const EyeIcon = icons.Eye || (() => null);
  const ChevronDownIcon = icons.ChevronDown || (() => null);
  const gamemodes = [
    { id: "Survival", label: "Survival", icon: HeartIcon, color: "text-rose-400" },
    { id: "Creative", label: "Creative", icon: SparklesIcon, color: "text-amber-400" },
    { id: "Adventure", label: "Adventure", icon: CompassIcon, color: "text-blue-400" },
    { id: "Spectator", label: "Spectator", icon: EyeIcon, color: "text-purple-400" }
  ];
  const currentMode = gamemodes.find((g) => g.id.toLowerCase() === (value || "survival").toLowerCase()) || gamemodes[0];
  const CurrentIcon = currentMode.icon;
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return /* @__PURE__ */ react_default.createElement("div", { className: "relative inline-block text-left", ref: dropdownRef }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      disabled,
      onClick: () => setIsOpen(!isOpen),
      className: "flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/90 hover:bg-muted border border-border/80 text-foreground font-semibold text-xs transition shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
    },
    /* @__PURE__ */ react_default.createElement(CurrentIcon, { className: `w-3.5 h-3.5 ${currentMode.color}` }),
    /* @__PURE__ */ react_default.createElement("span", null, currentMode.label),
    /* @__PURE__ */ react_default.createElement(ChevronDownIcon, { className: `w-3 h-3 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}` })
  ), isOpen && /* @__PURE__ */ react_default.createElement("div", { className: "absolute right-0 mt-1.5 w-36 rounded-xl bg-card/95 border border-border shadow-2xl backdrop-blur-md z-50 py-1 animate-in fade-in zoom-in-95 duration-150 overflow-hidden" }, gamemodes.map((mode) => {
    const Icon = mode.icon;
    const isSelected = mode.id.toLowerCase() === currentMode.id.toLowerCase();
    return /* @__PURE__ */ react_default.createElement(
      "button",
      {
        key: mode.id,
        type: "button",
        onClick: () => {
          onChange(mode.id);
          setIsOpen(false);
        },
        className: `w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition text-left ${isSelected ? "bg-primary/20 text-primary" : "text-foreground hover:bg-muted/80"}`
      },
      /* @__PURE__ */ react_default.createElement(Icon, { className: `w-3.5 h-3.5 ${mode.color}` }),
      /* @__PURE__ */ react_default.createElement("span", null, mode.label)
    );
  })));
};

// frontend/src/components/modals/TeleportModal.tsx
var TeleportModal = ({
  serverId,
  uuid,
  username,
  currentLocation,
  onClose,
  onSuccess
}) => {
  const kubek = typeof window !== "undefined" ? window.Kubek : void 0;
  if (!kubek) return null;
  const { ui, icons = {}, http, query, hooks } = kubek;
  const { t } = hooks?.useTranslation?.() || { t: (k) => k };
  const [dimension, setDimension] = useState(
    currentLocation?.world || "minecraft:overworld"
  );
  const [x, setX] = useState(currentLocation?.x ?? 0);
  const [y, setY] = useState(currentLocation?.y ?? 64);
  const [z, setZ] = useState(currentLocation?.z ?? 0);
  const tpMutation = query.useMutation({
    mutationFn: (body) => http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/teleport`, body),
    onSuccess: () => {
      onSuccess();
      onClose();
    }
  });
  const handleTeleport = (e) => {
    e.preventDefault();
    tpMutation.mutate({
      world: dimension,
      x: Number(x),
      y: Number(y),
      z: Number(z)
    });
  };
  const dimensions = [
    { value: "minecraft:overworld", label: "Overworld (minecraft:overworld)" },
    { value: "minecraft:the_nether", label: "The Nether (minecraft:the_nether)" },
    { value: "minecraft:the_end", label: "The End (minecraft:the_end)" }
  ];
  const CompassIcon = icons.Compass || icons.MapPin || (() => null);
  const XIcon = icons.X || (() => null);
  const SparklesIcon = icons.Sparkles || (() => null);
  return /* @__PURE__ */ react_default.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200" }, /* @__PURE__ */ react_default.createElement("div", { className: "bg-card border border-border/80 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border/50 bg-blue-600/10" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ react_default.createElement("div", { className: "p-2 rounded-lg bg-blue-600 text-white shadow-sm" }, /* @__PURE__ */ react_default.createElement(CompassIcon, { className: "w-5 h-5" })), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("h3", { className: "font-bold text-lg text-foreground" }, t("ext.players.teleport") || "Teleport", " ", username), /* @__PURE__ */ react_default.createElement("p", { className: "text-xs text-muted-foreground" }, "Specify target world & coordinates"))), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: onClose,
      className: "p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
    },
    /* @__PURE__ */ react_default.createElement(XIcon, { className: "w-5 h-5" })
  )), /* @__PURE__ */ react_default.createElement("form", { onSubmit: handleTeleport, className: "p-6 space-y-4" }, /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("label", { className: "block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider" }, t("ext.players.dimension") || "Dimension"), /* @__PURE__ */ react_default.createElement(
    "select",
    {
      value: dimension,
      onChange: (e) => setDimension(e.target.value),
      className: "w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
    },
    dimensions.map((d) => /* @__PURE__ */ react_default.createElement("option", { key: d.value, value: d.value }, d.label))
  )), /* @__PURE__ */ react_default.createElement("div", { className: "grid grid-cols-3 gap-3" }, /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("label", { className: "block text-xs font-bold text-muted-foreground mb-1 text-center" }, "X"), /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center rounded-xl border border-border/80 bg-background overflow-hidden" }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: () => setX((prev) => +(Number(prev) - 1).toFixed(2)),
      className: "px-2.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-bold"
    },
    "-"
  ), /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "number",
      step: "any",
      value: x,
      onChange: (e) => setX(parseFloat(e.target.value) || 0),
      className: "w-full text-center bg-transparent py-2 text-sm focus:outline-none font-mono"
    }
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: () => setX((prev) => +(Number(prev) + 1).toFixed(2)),
      className: "px-2.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-bold"
    },
    "+"
  ))), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("label", { className: "block text-xs font-bold text-muted-foreground mb-1 text-center" }, "Y"), /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center rounded-xl border border-border/80 bg-background overflow-hidden" }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: () => setY((prev) => +(Number(prev) - 1).toFixed(2)),
      className: "px-2.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-bold"
    },
    "-"
  ), /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "number",
      step: "any",
      value: y,
      onChange: (e) => setY(parseFloat(e.target.value) || 0),
      className: "w-full text-center bg-transparent py-2 text-sm focus:outline-none font-mono"
    }
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: () => setY((prev) => +(Number(prev) + 1).toFixed(2)),
      className: "px-2.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-bold"
    },
    "+"
  ))), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("label", { className: "block text-xs font-bold text-muted-foreground mb-1 text-center" }, "Z"), /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center rounded-xl border border-border/80 bg-background overflow-hidden" }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: () => setZ((prev) => +(Number(prev) - 1).toFixed(2)),
      className: "px-2.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-bold"
    },
    "-"
  ), /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "number",
      step: "any",
      value: z,
      onChange: (e) => setZ(parseFloat(e.target.value) || 0),
      className: "w-full text-center bg-transparent py-2 text-sm focus:outline-none font-mono"
    }
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: () => setZ((prev) => +(Number(prev) + 1).toFixed(2)),
      className: "px-2.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-bold"
    },
    "+"
  )))), /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center justify-end gap-2.5 pt-3" }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: onClose,
      className: "px-4 py-2.5 rounded-xl border border-border/70 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
    },
    t("ext.players.cancel") || "Cancel"
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "submit",
      disabled: tpMutation.isPending,
      className: "px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
    },
    /* @__PURE__ */ react_default.createElement(SparklesIcon, { className: "w-4 h-4" }),
    t("ext.players.teleport") || "Teleport"
  )))));
};

// frontend/src/components/modals/PurgeConfirmModal.tsx
var PurgeConfirmModal = ({
  username,
  options,
  onConfirm,
  onCancel,
  isPending
}) => {
  const kubek = typeof window !== "undefined" ? window.Kubek : void 0;
  const icons = kubek?.icons || {};
  const AlertTriangleIcon = icons.AlertTriangle || icons.ShieldAlert || (() => null);
  const TrashIcon = icons.Trash2 || (() => null);
  const XIcon = icons.X || (() => null);
  const selectedItems = [];
  if (options.experiencePoints) selectedItems.push("Experience points & Level");
  if (options.inventory) selectedItems.push("Player inventory & Hotbar items");
  if (options.enderChest) selectedItems.push("Ender Chest contents");
  if (options.playerDataFile) selectedItems.push("World playerdata file (.dat)");
  if (options.statisticsFile) selectedItems.push("Gameplay statistics file (.json)");
  if (options.advancementsFile) selectedItems.push("Advancements & Progress (.json)");
  return /* @__PURE__ */ react_default.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150" }, /* @__PURE__ */ react_default.createElement("div", { className: "bg-card border border-rose-500/40 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center justify-between px-6 py-4 border-b border-border/50 bg-rose-500/10" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ react_default.createElement("div", { className: "p-2 rounded-xl bg-rose-500/20 text-rose-400" }, /* @__PURE__ */ react_default.createElement(AlertTriangleIcon, { className: "w-5 h-5" })), /* @__PURE__ */ react_default.createElement("h3", { className: "font-extrabold text-base text-foreground" }, "Confirm Data Deletion")), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: onCancel,
      disabled: isPending,
      className: "p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
    },
    /* @__PURE__ */ react_default.createElement(XIcon, { className: "w-5 h-5" })
  )), /* @__PURE__ */ react_default.createElement("div", { className: "p-6 space-y-4 text-sm" }, /* @__PURE__ */ react_default.createElement("p", { className: "text-muted-foreground leading-relaxed" }, "Are you sure you want to permanently delete the selected data for player", " ", /* @__PURE__ */ react_default.createElement("span", { className: "font-extrabold text-foreground" }, username), "?"), /* @__PURE__ */ react_default.createElement("div", { className: "p-3.5 rounded-2xl bg-muted/40 border border-border/50 space-y-2" }, /* @__PURE__ */ react_default.createElement("div", { className: "text-xs font-bold text-rose-400 uppercase tracking-wider" }, "Selected data categories (", selectedItems.length, "):"), /* @__PURE__ */ react_default.createElement("ul", { className: "space-y-1 text-xs text-foreground/90" }, selectedItems.map((item, idx) => /* @__PURE__ */ react_default.createElement("li", { key: `purge-item-${idx}`, className: "flex items-center gap-2" }, /* @__PURE__ */ react_default.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" }), /* @__PURE__ */ react_default.createElement("span", null, item))))), /* @__PURE__ */ react_default.createElement("div", { className: "p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold" }, "\u26A0\uFE0F This operation cannot be undone. Backup files are recommended before proceeding.")), /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center justify-end gap-3 px-6 py-4 border-t border-border/50 bg-muted/20" }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: onCancel,
      disabled: isPending,
      className: "px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition"
    },
    "Cancel"
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: onConfirm,
      disabled: isPending,
      className: "px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
    },
    /* @__PURE__ */ react_default.createElement(TrashIcon, { className: "w-4 h-4" }),
    isPending ? "Deleting..." : "Yes, Delete Data"
  ))));
};

// frontend/src/components/PlayerDetailsModal.tsx
var PlayerDetailsModal = ({
  serverId,
  uuid,
  onClose,
  onChanged
}) => {
  const kubek = typeof window !== "undefined" ? window.Kubek : void 0;
  if (!kubek) return null;
  const { ui, icons = {}, http, query, hooks } = kubek;
  const { t } = hooks?.useTranslation?.() || { t: (k) => k };
  const [showTeleport, setShowTeleport] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [inventoryTab, setInventoryTab] = useState("main");
  const [purgeOptions, setPurgeOptions] = useState({
    experiencePoints: false,
    inventory: false,
    enderChest: false,
    playerDataFile: false,
    statisticsFile: false,
    advancementsFile: false
  });
  const [selectAllPurge, setSelectAllPurge] = useState(false);
  const detailsQuery = query.useQuery({
    queryKey: ["ext", "players", serverId, "player", uuid],
    queryFn: () => http.get(`ext/com.kubek.players/servers/${serverId}/players/${uuid}`),
    refetchInterval: 6e3
  });
  const details = detailsQuery.data;
  const vitalsMutation = query.useMutation({
    mutationFn: (action) => http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/vitals`, { action }),
    onSuccess: () => {
      detailsQuery.refetch();
      onChanged();
    }
  });
  const gamemodeMutation = query.useMutation({
    mutationFn: (gamemode) => http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/gamemode`, { gamemode }),
    onSuccess: () => {
      detailsQuery.refetch();
      onChanged();
    }
  });
  const kickMutation = query.useMutation({
    mutationFn: () => http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/kick`),
    onSuccess: () => {
      detailsQuery.refetch();
      onChanged();
    }
  });
  const permissionMutation = query.useMutation({
    mutationFn: (body) => http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/permissions`, body),
    onSuccess: () => {
      detailsQuery.refetch();
      onChanged();
    }
  });
  const purgeMutation = query.useMutation({
    mutationFn: (body) => http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/purge`, body),
    onSuccess: () => {
      setShowPurgeConfirm(false);
      detailsQuery.refetch();
      onChanged();
      alert("Selected player data has been purged successfully.");
    }
  });
  const handleCopyUuid = () => {
    if (details?.summary?.uuid) {
      navigator.clipboard.writeText(details.summary.uuid);
      setCopiedUuid(true);
      setTimeout(() => setCopiedUuid(false), 2e3);
    }
  };
  const handleToggleSelectAll = (checked) => {
    setSelectAllPurge(checked);
    setPurgeOptions({
      experiencePoints: checked,
      inventory: checked,
      enderChest: checked,
      playerDataFile: checked,
      statisticsFile: checked,
      advancementsFile: checked
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
  const renderHearts = (hp = 20) => {
    const hearts = [];
    const validHp = typeof hp === "number" && !isNaN(hp) ? hp : 20;
    for (let i = 1; i <= 10; i++) {
      const heartValue = i * 2;
      const type = validHp >= heartValue ? "full" : validHp >= heartValue - 1 ? "half" : "empty";
      hearts.push(
        /* @__PURE__ */ react_default.createElement("div", { key: `heart-slot-${i}`, className: "w-5 h-5 flex items-center justify-center" }, /* @__PURE__ */ react_default.createElement(MinecraftHeart, { type, className: "w-5 h-5" }))
      );
    }
    return hearts;
  };
  const renderFood = (food = 20) => {
    const drumsticks = [];
    const validFood = typeof food === "number" && !isNaN(food) ? food : 20;
    for (let i = 1; i <= 10; i++) {
      const foodValue = i * 2;
      const type = validFood >= foodValue ? "full" : validFood >= foodValue - 1 ? "half" : "empty";
      drumsticks.push(
        /* @__PURE__ */ react_default.createElement("div", { key: `food-slot-${i}`, className: "w-5 h-5 flex items-center justify-center" }, /* @__PURE__ */ react_default.createElement(MinecraftFood, { type, className: "w-5 h-5" }))
      );
    }
    return drumsticks;
  };
  const renderSlot = (item, slotKey, placeholderIcon) => {
    if (!item) {
      return /* @__PURE__ */ react_default.createElement("div", { key: slotKey, className: "mc-slot", title: "Empty" }, placeholderIcon || null);
    }
    const cleanId = (item.id || "").replace("minecraft:", "");
    const itemImgUrl = `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/${cleanId}.png`;
    const blockImgUrl = `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/block/${cleanId}.png`;
    return /* @__PURE__ */ react_default.createElement(
      "div",
      {
        key: slotKey,
        className: "mc-slot mc-slot-filled cursor-pointer",
        title: `${item.displayName || cleanId} (${item.id}) x${item.count || 1}`
      },
      /* @__PURE__ */ react_default.createElement(
        "img",
        {
          src: itemImgUrl,
          alt: item.displayName,
          className: "mc-slot-item-img",
          onError: (e) => {
            if (e.target.src !== blockImgUrl) {
              e.target.src = blockImgUrl;
            } else {
              e.target.style.display = "none";
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = "block";
              }
            }
          }
        }
      ),
      /* @__PURE__ */ react_default.createElement(
        "span",
        {
          className: "mc-slot-item-text",
          style: { display: "none" }
        },
        (item.displayName || cleanId).slice(0, 3)
      ),
      item.count > 1 && /* @__PURE__ */ react_default.createElement("span", { className: "mc-slot-count" }, item.count)
    );
  };
  return /* @__PURE__ */ react_default.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200" }, /* @__PURE__ */ react_default.createElement("div", { className: "bg-card border border-border/80 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center justify-between px-6 py-3.5 border-b border-border/50 bg-muted/30" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ react_default.createElement(UserIcon, { className: "w-5 h-5 text-primary" }), /* @__PURE__ */ react_default.createElement("h3", { className: "font-bold text-base text-foreground" }, t("ext.players.details") || "Player details")), /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ react_default.createElement("span", { className: "text-xs text-muted-foreground hidden sm:inline" }, "Refreshed ", details?.lastRefreshedText || "just now"), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: () => detailsQuery.refetch(),
      disabled: detailsQuery.isLoading,
      className: "px-3 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center gap-1.5 transition"
    },
    /* @__PURE__ */ react_default.createElement(
      RefreshIcon,
      {
        className: `w-3.5 h-3.5 ${detailsQuery.isLoading ? "animate-spin" : ""}`
      }
    ),
    t("ext.players.refresh") || "Refresh"
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: onClose,
      className: "p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
    },
    /* @__PURE__ */ react_default.createElement(XIcon, { className: "w-5 h-5" })
  ))), detailsQuery.isLoading && !details ? /* @__PURE__ */ react_default.createElement("div", { className: "flex-1 flex items-center justify-center py-24 text-muted-foreground" }, /* @__PURE__ */ react_default.createElement(RefreshIcon, { className: "w-8 h-8 animate-spin mr-3 text-primary" }), "Loading player details...") : /* @__PURE__ */ react_default.createElement("div", { className: "p-6 overflow-y-auto flex-1 space-y-6" }, /* @__PURE__ */ react_default.createElement("div", { className: "p-5 rounded-2xl bg-gradient-to-r from-muted/60 to-muted/20 border border-border/70 flex flex-col md:flex-row md:items-center justify-between gap-4" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ react_default.createElement("div", { className: "relative" }, /* @__PURE__ */ react_default.createElement(
    "img",
    {
      src: details?.summary?.skinAvatarUrl || `https://crafatar.com/avatars/${details?.summary?.username}?size=56`,
      alt: details?.summary?.username,
      className: "w-14 h-14 rounded-2xl bg-background shadow-md border-2 border-border/80 object-cover",
      onError: (e) => {
        e.target.src = "https://crafatar.com/avatars/steve?size=56";
      }
    }
  ), details?.summary?.isOnline && /* @__PURE__ */ react_default.createElement("div", { className: "absolute -bottom-1 -right-1 players-pulse-dot border-2 border-card" })), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-2.5 flex-wrap" }, /* @__PURE__ */ react_default.createElement("h2", { className: "text-xl font-black text-foreground" }, details?.summary?.username), details?.summary?.isOnline ? /* @__PURE__ */ react_default.createElement("span", { className: "px-2.5 py-0.5 rounded-full font-bold text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1" }, /* @__PURE__ */ react_default.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400" }), "Online") : /* @__PURE__ */ react_default.createElement("span", { className: "px-2.5 py-0.5 rounded-full font-medium text-xs bg-muted text-muted-foreground border border-border" }, "Offline")), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: handleCopyUuid,
      className: "flex items-center gap-1.5 mt-1 text-xs font-mono text-muted-foreground hover:text-foreground transition group",
      title: "Click to copy UUID"
    },
    /* @__PURE__ */ react_default.createElement("span", null, details?.summary?.uuid),
    copiedUuid ? /* @__PURE__ */ react_default.createElement(CheckIcon, { className: "w-3.5 h-3.5 text-emerald-400" }) : /* @__PURE__ */ react_default.createElement(CopyIcon, { className: "w-3.5 h-3.5 opacity-60 group-hover:opacity-100" })
  ))), /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-3 flex-wrap" }, /* @__PURE__ */ react_default.createElement(
    GamemodeSelect,
    {
      value: details?.gamemode || "Survival",
      onChange: (mode) => gamemodeMutation.mutate(mode),
      disabled: gamemodeMutation.isPending
    }
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: () => kickMutation.mutate(),
      disabled: kickMutation.isPending || !details?.summary?.isOnline,
      className: "px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition disabled:opacity-40 flex items-center gap-1.5"
    },
    /* @__PURE__ */ react_default.createElement(UserXIcon, { className: "w-3.5 h-3.5" }),
    t("ext.players.kick") || "Kick"
  ))), /* @__PURE__ */ react_default.createElement("div", { className: "mc-split-container" }, /* @__PURE__ */ react_default.createElement("div", { className: "mc-split-left" }, /* @__PURE__ */ react_default.createElement("div", { className: "p-5 rounded-2xl bg-card border border-border/70 space-y-4 shadow-sm" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_default.createElement("h4", { className: "text-sm font-bold text-foreground flex items-center gap-2" }, /* @__PURE__ */ react_default.createElement(ActivityIcon, { className: "w-4 h-4 text-emerald-400" }), t("ext.players.vitals") || "Health and Experience"), /* @__PURE__ */ react_default.createElement("span", { className: "text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20" }, "Level ", details?.vitals?.level ?? 0)), /* @__PURE__ */ react_default.createElement("div", { className: "mc-bar-bg" }, /* @__PURE__ */ react_default.createElement(
    "div",
    {
      className: "mc-bar-xp",
      style: {
        width: `${Math.round((details?.vitals?.xpProgress ?? 0) * 100)}%`
      }
    }
  )), /* @__PURE__ */ react_default.createElement("div", { className: "mc-hud-row" }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: () => vitalsMutation.mutate("kill"),
      disabled: vitalsMutation.isPending,
      className: "w-20 py-1.5 rounded-xl bg-rose-600/15 hover:bg-rose-600 border border-rose-500/30 text-rose-400 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 flex-shrink-0",
      title: "Kill player"
    },
    /* @__PURE__ */ react_default.createElement(SkullIcon, { className: "w-3.5 h-3.5" }),
    /* @__PURE__ */ react_default.createElement("span", null, t("ext.players.kill") || "Kill")
  ), /* @__PURE__ */ react_default.createElement("div", { className: "mc-icons-grid" }, renderHearts(details?.vitals?.health)), /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-2 flex-shrink-0" }, /* @__PURE__ */ react_default.createElement("span", { className: "w-24 text-center text-xs font-mono font-extrabold text-rose-400 bg-rose-500/10 py-1 rounded-lg border border-rose-500/20" }, details?.vitals?.health ?? 20, " / 20 HP"), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: () => vitalsMutation.mutate("heal"),
      disabled: vitalsMutation.isPending,
      className: "w-20 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-400 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 flex-shrink-0",
      title: "Heal player"
    },
    /* @__PURE__ */ react_default.createElement(HeartPulseIcon, { className: "w-3.5 h-3.5" }),
    /* @__PURE__ */ react_default.createElement("span", null, t("ext.players.heal") || "Heal")
  ))), /* @__PURE__ */ react_default.createElement("div", { className: "mc-hud-row" }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: () => vitalsMutation.mutate("starve"),
      disabled: vitalsMutation.isPending,
      className: "w-20 py-1.5 rounded-xl bg-rose-600/15 hover:bg-rose-600 border border-rose-500/30 text-rose-400 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 flex-shrink-0",
      title: "Starve player"
    },
    /* @__PURE__ */ react_default.createElement(SkullIcon, { className: "w-3.5 h-3.5" }),
    /* @__PURE__ */ react_default.createElement("span", null, t("ext.players.starve") || "Starve")
  ), /* @__PURE__ */ react_default.createElement("div", { className: "mc-icons-grid" }, renderFood(details?.vitals?.food)), /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-2 flex-shrink-0" }, /* @__PURE__ */ react_default.createElement("span", { className: "w-24 text-center text-xs font-mono font-extrabold text-amber-400 bg-amber-500/10 py-1 rounded-lg border border-amber-500/20" }, details?.vitals?.food ?? 20, " / 20 Food"), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: () => vitalsMutation.mutate("feed"),
      disabled: vitalsMutation.isPending,
      className: "w-20 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-400 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 flex-shrink-0",
      title: "Feed player"
    },
    /* @__PURE__ */ react_default.createElement(UtensilsIcon, { className: "w-3.5 h-3.5" }),
    /* @__PURE__ */ react_default.createElement("span", null, t("ext.players.feed") || "Feed")
  )))), /* @__PURE__ */ react_default.createElement("div", { className: "p-5 rounded-2xl bg-card border border-border/70 space-y-4 shadow-sm" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_default.createElement("h4", { className: "text-sm font-bold text-foreground flex items-center gap-2" }, /* @__PURE__ */ react_default.createElement(BoxIcon, { className: "w-4 h-4 text-amber-400" }), t("ext.players.inventory") || "Inventory"), /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/60 text-xs" }, /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: () => setInventoryTab("main"),
      className: `px-3 py-1 rounded-lg font-bold transition ${inventoryTab === "main" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`
    },
    "Inventory"
  ), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: () => setInventoryTab("ender"),
      className: `px-3 py-1 rounded-lg font-bold transition ${inventoryTab === "ender" ? "bg-purple-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`
    },
    "Ender Chest"
  ))), /* @__PURE__ */ react_default.createElement("div", { className: "flex justify-center items-center w-full py-2 overflow-x-auto" }, /* @__PURE__ */ react_default.createElement("div", { className: "mc-inv-container" }, inventoryTab === "main" ? /* @__PURE__ */ react_default.createElement("div", { className: "flex flex-col gap-1" }, /* @__PURE__ */ react_default.createElement(
    "div",
    {
      className: "grid gap-1",
      style: {
        gridTemplateColumns: "54px 54px repeat(9, 54px)",
        gridTemplateRows: "repeat(3, 54px)"
      }
    },
    renderSlot(
      details?.inventory?.armor?.helmet,
      "armor-helmet",
      /* @__PURE__ */ react_default.createElement(SlotHelmetIcon, null)
    ),
    /* @__PURE__ */ react_default.createElement("div", { className: "w-[54px] h-[54px] opacity-0 pointer-events-none" }),
    (details?.inventory?.main?.slice(0, 9) || Array(9).fill(null)).map(
      (item, idx) => renderSlot(item, `main-slot-${idx}`)
    ),
    renderSlot(
      details?.inventory?.armor?.chestplate,
      "armor-chestplate",
      /* @__PURE__ */ react_default.createElement(SlotChestplateIcon, null)
    ),
    /* @__PURE__ */ react_default.createElement("div", { className: "w-[54px] h-[54px] opacity-0 pointer-events-none" }),
    (details?.inventory?.main?.slice(9, 18) || Array(9).fill(null)).map(
      (item, idx) => renderSlot(item, `main-slot-${9 + idx}`)
    ),
    renderSlot(
      details?.inventory?.armor?.leggings,
      "armor-leggings",
      /* @__PURE__ */ react_default.createElement(SlotLeggingsIcon, null)
    ),
    /* @__PURE__ */ react_default.createElement("div", { className: "w-[54px] h-[54px] opacity-0 pointer-events-none" }),
    (details?.inventory?.main?.slice(18, 27) || Array(9).fill(null)).map(
      (item, idx) => renderSlot(item, `main-slot-${18 + idx}`)
    )
  ), /* @__PURE__ */ react_default.createElement("div", { className: "border-t border-dashed border-[#555555]/80 my-1 w-full" }), /* @__PURE__ */ react_default.createElement(
    "div",
    {
      className: "grid gap-1",
      style: {
        gridTemplateColumns: "54px 54px repeat(9, 54px)",
        gridTemplateRows: "54px"
      }
    },
    renderSlot(
      details?.inventory?.armor?.boots,
      "armor-boots",
      /* @__PURE__ */ react_default.createElement(SlotBootsIcon, null)
    ),
    renderSlot(
      details?.inventory?.offhand,
      "armor-shield",
      /* @__PURE__ */ react_default.createElement(SlotShieldIcon, null)
    ),
    (details?.inventory?.hotbar || Array(9).fill(null)).map(
      (item, idx) => renderSlot(item, `hotbar-slot-${idx}`)
    )
  )) : (
    /* Ender Chest (27 slots) */
    /* @__PURE__ */ react_default.createElement("div", { className: "mc-ender-grid" }, (details?.inventory?.enderChest || Array(27).fill(null)).map(
      (item, idx) => renderSlot(item, `ender-slot-${idx}`)
    ))
  ))))), /* @__PURE__ */ react_default.createElement("div", { className: "mc-split-right" }, /* @__PURE__ */ react_default.createElement("div", { className: "p-5 rounded-2xl bg-card border border-border/70 space-y-3.5 shadow-sm" }, /* @__PURE__ */ react_default.createElement("h4", { className: "text-sm font-bold text-foreground flex items-center gap-2" }, /* @__PURE__ */ react_default.createElement(ShieldIcon, { className: "w-4 h-4 text-blue-400" }), t("ext.players.control") || "Control"), /* @__PURE__ */ react_default.createElement("div", { className: "space-y-2.5" }, /* @__PURE__ */ react_default.createElement("label", { className: "flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40 cursor-pointer hover:bg-muted/70 transition" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ react_default.createElement(UserCheckIcon, { className: "w-4 h-4 text-blue-400" }), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { className: "text-sm font-semibold text-foreground" }, t("ext.players.whitelisted") || "Whitelisted"), /* @__PURE__ */ react_default.createElement("div", { className: "text-[11px] text-muted-foreground" }, "Allow player to join when whitelist is active"))), /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "checkbox",
      checked: Boolean(details?.permissions?.isWhitelisted),
      onChange: (e) => permissionMutation.mutate({
        perm: "whitelist",
        value: e.target.checked
      }),
      className: "w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
    }
  )), /* @__PURE__ */ react_default.createElement("label", { className: "flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40 cursor-pointer hover:bg-muted/70 transition" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ react_default.createElement(CrownIcon, { className: "w-4 h-4 text-amber-400" }), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { className: "text-sm font-semibold text-foreground" }, t("ext.players.operator") || "Operator"), /* @__PURE__ */ react_default.createElement("div", { className: "text-[11px] text-muted-foreground" }, "Grant OP level admin commands & permissions"))), /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "checkbox",
      checked: Boolean(details?.permissions?.isOp),
      onChange: (e) => permissionMutation.mutate({
        perm: "op",
        value: e.target.checked
      }),
      className: "w-5 h-5 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
    }
  )), /* @__PURE__ */ react_default.createElement("label", { className: "flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40 cursor-pointer hover:bg-muted/70 transition" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ react_default.createElement(UserXIcon, { className: "w-4 h-4 text-rose-400" }), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { className: "text-sm font-semibold text-foreground" }, t("ext.players.banned") || "Banned"), /* @__PURE__ */ react_default.createElement("div", { className: "text-[11px] text-muted-foreground" }, "Block player from connecting to the server"))), /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "checkbox",
      checked: Boolean(details?.permissions?.isBanned),
      onChange: (e) => permissionMutation.mutate({
        perm: "ban",
        value: e.target.checked
      }),
      className: "w-5 h-5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
    }
  )))), /* @__PURE__ */ react_default.createElement("div", { className: "p-5 rounded-2xl bg-card border border-border/70 space-y-4 shadow-sm" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_default.createElement("h4", { className: "text-sm font-bold text-foreground flex items-center gap-2" }, /* @__PURE__ */ react_default.createElement(MapPinIcon, { className: "w-4 h-4 text-purple-400" }), t("ext.players.position") || "Current position"), /* @__PURE__ */ react_default.createElement("span", { className: "text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20" }, details?.location?.world || "minecraft:overworld")), /* @__PURE__ */ react_default.createElement("div", { className: "grid grid-cols-3 gap-3" }, /* @__PURE__ */ react_default.createElement("div", { className: "coord-box" }, /* @__PURE__ */ react_default.createElement("div", { className: "text-[10px] font-extrabold text-rose-400 uppercase tracking-wider mb-0.5" }, "X Axis"), /* @__PURE__ */ react_default.createElement("div", { className: "font-mono font-extrabold text-base text-foreground" }, details?.location?.x ?? 0)), /* @__PURE__ */ react_default.createElement("div", { className: "coord-box" }, /* @__PURE__ */ react_default.createElement("div", { className: "text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider mb-0.5" }, "Y Axis (Height)"), /* @__PURE__ */ react_default.createElement("div", { className: "font-mono font-extrabold text-base text-foreground" }, details?.location?.y ?? 64)), /* @__PURE__ */ react_default.createElement("div", { className: "coord-box" }, /* @__PURE__ */ react_default.createElement("div", { className: "text-[10px] font-extrabold text-blue-400 uppercase tracking-wider mb-0.5" }, "Z Axis"), /* @__PURE__ */ react_default.createElement("div", { className: "font-mono font-extrabold text-base text-foreground" }, details?.location?.z ?? 0))), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: () => setShowTeleport(true),
      className: "w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
    },
    /* @__PURE__ */ react_default.createElement(SparklesIcon, { className: "w-4 h-4" }),
    t("ext.players.teleport") || "Teleport"
  )))), /* @__PURE__ */ react_default.createElement("div", { className: "p-5 rounded-2xl bg-card border border-border/70 space-y-4 shadow-sm" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_default.createElement("h4", { className: "text-sm font-bold text-foreground flex items-center gap-2" }, /* @__PURE__ */ react_default.createElement(BarChartIcon, { className: "w-4 h-4 text-cyan-400" }), t("ext.players.stats") || "Gameplay Statistics")), /* @__PURE__ */ react_default.createElement("div", { className: "mc-stats-grid-4" }, /* @__PURE__ */ react_default.createElement("div", { className: "p-3 rounded-xl bg-muted/40 border border-border/40 text-center" }, /* @__PURE__ */ react_default.createElement(ClockIcon, { className: "w-5 h-5 mx-auto text-cyan-400 mb-1.5" }), /* @__PURE__ */ react_default.createElement("div", { className: "text-[11px] text-muted-foreground font-medium" }, "Total Playtime"), /* @__PURE__ */ react_default.createElement("div", { className: "font-black text-sm text-foreground truncate mt-0.5" }, details?.stats?.playtimeText || "0m")), /* @__PURE__ */ react_default.createElement("div", { className: "p-3 rounded-xl bg-muted/40 border border-border/40 text-center" }, /* @__PURE__ */ react_default.createElement(SwordsIcon, { className: "w-5 h-5 mx-auto text-rose-400 mb-1.5" }), /* @__PURE__ */ react_default.createElement("div", { className: "text-[11px] text-muted-foreground font-medium" }, "Player Kills"), /* @__PURE__ */ react_default.createElement("div", { className: "font-black text-sm text-foreground mt-0.5" }, details?.stats?.playerKills ?? 0)), /* @__PURE__ */ react_default.createElement("div", { className: "p-3 rounded-xl bg-muted/40 border border-border/40 text-center" }, /* @__PURE__ */ react_default.createElement(SkullIcon, { className: "w-5 h-5 mx-auto text-muted-foreground mb-1.5" }), /* @__PURE__ */ react_default.createElement("div", { className: "text-[11px] text-muted-foreground font-medium" }, "Total Deaths"), /* @__PURE__ */ react_default.createElement("div", { className: "font-black text-sm text-foreground mt-0.5" }, details?.stats?.deaths ?? 0)), /* @__PURE__ */ react_default.createElement("div", { className: "p-3 rounded-xl bg-muted/40 border border-border/40 text-center" }, /* @__PURE__ */ react_default.createElement(GaugeIcon, { className: "w-5 h-5 mx-auto text-amber-400 mb-1.5" }), /* @__PURE__ */ react_default.createElement("div", { className: "text-[11px] text-muted-foreground font-medium" }, "Kill / Death Ratio"), /* @__PURE__ */ react_default.createElement("div", { className: "font-black text-sm text-foreground mt-0.5" }, details?.stats?.kdr ?? 0))), /* @__PURE__ */ react_default.createElement("div", { className: "mc-stats-grid-3 pt-2" }, /* @__PURE__ */ react_default.createElement("div", { className: "p-3.5 rounded-xl bg-muted/30 border border-border/30 space-y-2" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-1.5 text-xs font-bold text-foreground mb-1" }, /* @__PURE__ */ react_default.createElement(FootprintsIcon, { className: "w-3.5 h-3.5 text-blue-400" }), /* @__PURE__ */ react_default.createElement("span", null, "Travel & Movement")), /* @__PURE__ */ react_default.createElement("div", { className: "flex justify-between text-xs text-muted-foreground" }, /* @__PURE__ */ react_default.createElement("span", null, "Total Distance:"), /* @__PURE__ */ react_default.createElement("span", { className: "font-bold text-foreground" }, details?.stats?.distanceTotal ?? 0, " blocks")), /* @__PURE__ */ react_default.createElement("div", { className: "flex justify-between text-xs text-muted-foreground" }, /* @__PURE__ */ react_default.createElement("span", null, "Distance Sprinted:"), /* @__PURE__ */ react_default.createElement("span", { className: "font-bold text-foreground" }, details?.stats?.distanceSprinted ?? 0, " blocks")), /* @__PURE__ */ react_default.createElement("div", { className: "flex justify-between text-xs text-muted-foreground" }, /* @__PURE__ */ react_default.createElement("span", null, "Distance Walked:"), /* @__PURE__ */ react_default.createElement("span", { className: "font-bold text-foreground" }, details?.stats?.distanceWalked ?? 0, " blocks"))), /* @__PURE__ */ react_default.createElement("div", { className: "p-3.5 rounded-xl bg-muted/30 border border-border/30 space-y-2" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-1.5 text-xs font-bold text-foreground mb-1" }, /* @__PURE__ */ react_default.createElement(PickaxeIcon, { className: "w-3.5 h-3.5 text-amber-400" }), /* @__PURE__ */ react_default.createElement("span", null, "Mining & Construction")), /* @__PURE__ */ react_default.createElement("div", { className: "flex justify-between text-xs text-muted-foreground" }, /* @__PURE__ */ react_default.createElement("span", null, "Blocks Broken:"), /* @__PURE__ */ react_default.createElement("span", { className: "font-bold text-foreground" }, details?.stats?.blocksBroken ?? "No data")), /* @__PURE__ */ react_default.createElement("div", { className: "flex justify-between text-xs text-muted-foreground" }, /* @__PURE__ */ react_default.createElement("span", null, "Items Used:"), /* @__PURE__ */ react_default.createElement("span", { className: "font-bold text-foreground" }, details?.stats?.itemsUsed ?? "No data"))), /* @__PURE__ */ react_default.createElement("div", { className: "p-3.5 rounded-xl bg-muted/30 border border-border/30 space-y-2" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-1.5 text-xs font-bold text-foreground mb-1" }, /* @__PURE__ */ react_default.createElement(SwordsIcon, { className: "w-3.5 h-3.5 text-rose-400" }), /* @__PURE__ */ react_default.createElement("span", null, "Combat & Hunting")), /* @__PURE__ */ react_default.createElement("div", { className: "flex justify-between text-xs text-muted-foreground" }, /* @__PURE__ */ react_default.createElement("span", null, "Entities Killed:"), /* @__PURE__ */ react_default.createElement("span", { className: "font-bold text-foreground" }, details?.stats?.entitiesKilled ?? "No data")), /* @__PURE__ */ react_default.createElement("div", { className: "flex justify-between text-xs text-muted-foreground" }, /* @__PURE__ */ react_default.createElement("span", null, "K/D Ratio:"), /* @__PURE__ */ react_default.createElement("span", { className: "font-bold text-foreground" }, details?.stats?.kdr ?? 0))))), /* @__PURE__ */ react_default.createElement("div", { className: "p-5 rounded-2xl bg-rose-600/10 border border-rose-500/30 space-y-4 shadow-sm" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_default.createElement("h4", { className: "text-sm font-bold text-rose-400 flex items-center gap-2" }, /* @__PURE__ */ react_default.createElement(TrashIcon, { className: "w-4 h-4" }), t("ext.players.purge_data") || "Delete player data"), /* @__PURE__ */ react_default.createElement("span", { className: "text-xs text-rose-400/80" }, "Permanent destructive purge tool")), /* @__PURE__ */ react_default.createElement("div", { className: "mc-purge-grid" }, /* @__PURE__ */ react_default.createElement("label", { className: "flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/40 cursor-pointer hover:bg-background/80 transition" }, /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "checkbox",
      checked: purgeOptions.experiencePoints,
      onChange: (e) => setPurgeOptions((prev) => ({
        ...prev,
        experiencePoints: e.target.checked
      })),
      className: "rounded text-rose-600"
    }
  ), /* @__PURE__ */ react_default.createElement("span", null, "Experience points")), /* @__PURE__ */ react_default.createElement("label", { className: "flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/40 cursor-pointer hover:bg-background/80 transition" }, /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "checkbox",
      checked: purgeOptions.inventory,
      onChange: (e) => setPurgeOptions((prev) => ({
        ...prev,
        inventory: e.target.checked
      })),
      className: "rounded text-rose-600"
    }
  ), /* @__PURE__ */ react_default.createElement("span", null, "Inventory")), /* @__PURE__ */ react_default.createElement("label", { className: "flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/40 cursor-pointer hover:bg-background/80 transition" }, /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "checkbox",
      checked: purgeOptions.enderChest,
      onChange: (e) => setPurgeOptions((prev) => ({
        ...prev,
        enderChest: e.target.checked
      })),
      className: "rounded text-rose-600"
    }
  ), /* @__PURE__ */ react_default.createElement("span", null, "Ender Chest")), /* @__PURE__ */ react_default.createElement("label", { className: "flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/40 cursor-pointer hover:bg-background/80 transition" }, /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "checkbox",
      checked: purgeOptions.playerDataFile,
      onChange: (e) => setPurgeOptions((prev) => ({
        ...prev,
        playerDataFile: e.target.checked
      })),
      className: "rounded text-rose-600"
    }
  ), /* @__PURE__ */ react_default.createElement("span", null, "Player data file")), /* @__PURE__ */ react_default.createElement("label", { className: "flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/40 cursor-pointer hover:bg-background/80 transition" }, /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "checkbox",
      checked: purgeOptions.statisticsFile,
      onChange: (e) => setPurgeOptions((prev) => ({
        ...prev,
        statisticsFile: e.target.checked
      })),
      className: "rounded text-rose-600"
    }
  ), /* @__PURE__ */ react_default.createElement("span", null, "Statistics file")), /* @__PURE__ */ react_default.createElement("label", { className: "flex items-center gap-2 p-2.5 rounded-xl bg-background/50 border border-border/40 cursor-pointer hover:bg-background/80 transition" }, /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "checkbox",
      checked: purgeOptions.advancementsFile,
      onChange: (e) => setPurgeOptions((prev) => ({
        ...prev,
        advancementsFile: e.target.checked
      })),
      className: "rounded text-rose-600"
    }
  ), /* @__PURE__ */ react_default.createElement("span", null, "Advancements file"))), /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center justify-between pt-3 border-t border-rose-500/20" }, /* @__PURE__ */ react_default.createElement("label", { className: "flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer" }, /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "checkbox",
      checked: selectAllPurge,
      onChange: (e) => handleToggleSelectAll(e.target.checked),
      className: "rounded text-rose-600"
    }
  ), /* @__PURE__ */ react_default.createElement("span", null, "Select all categories")), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "submit",
      onClick: handleOpenPurgeDialog,
      disabled: purgeMutation.isPending,
      className: "px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
    },
    /* @__PURE__ */ react_default.createElement(TrashIcon, { className: "w-4 h-4" }),
    t("ext.players.confirm_purge") || "Delete player data"
  ))))), showTeleport && /* @__PURE__ */ react_default.createElement(
    TeleportModal,
    {
      serverId,
      uuid,
      username: details?.summary?.username || uuid,
      currentLocation: details?.location,
      onClose: () => setShowTeleport(false),
      onSuccess: () => detailsQuery.refetch()
    }
  ), showPurgeConfirm && /* @__PURE__ */ react_default.createElement(
    PurgeConfirmModal,
    {
      username: details?.summary?.username || uuid,
      options: purgeOptions,
      onConfirm: () => purgeMutation.mutate(purgeOptions),
      onCancel: () => setShowPurgeConfirm(false),
      isPending: purgeMutation.isPending
    }
  ));
};

// frontend/src/components/PlayersDashboard.tsx
var PlayersDashboard = () => {
  const kubek = typeof window !== "undefined" ? window.Kubek : void 0;
  if (!kubek || !kubek.query?.useQuery) {
    return /* @__PURE__ */ react_default.createElement("div", { className: "p-8 text-center text-muted-foreground animate-pulse text-sm" }, "Loading Players module...");
  }
  const { ui, icons, http, query, hooks } = kubek;
  const { t } = hooks?.useTranslation?.() || { t: (k) => k };
  const [selectedServerId, setSelectedServerId] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedPlayerUuid, setSelectedPlayerUuid] = useState(null);
  useEffect(() => {
    const patchIcon = () => {
      const elements = document.querySelectorAll('a, button, [role="button"], div, li');
      elements.forEach((el) => {
        const href = el.getAttribute("href") || "";
        const text = (el.textContent || "").trim();
        if (href.includes("com.kubek.players") || href.includes("PlayersDashboard") || text.startsWith("Players") && text.length <= 15) {
          const svg = el.querySelector("svg");
          if (svg) {
            svg.setAttribute("viewBox", "0 0 24 24");
            svg.setAttribute("fill", "none");
            svg.setAttribute("stroke", "currentColor");
            svg.setAttribute("stroke-width", "2");
            svg.setAttribute("stroke-linecap", "round");
            svg.setAttribute("stroke-linejoin", "round");
            svg.innerHTML = '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path>';
          }
        }
      });
    };
    patchIcon();
    const t1 = setTimeout(patchIcon, 50);
    const t2 = setTimeout(patchIcon, 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  const serversQuery = query.useQuery({
    queryKey: ["servers", "list"],
    queryFn: () => http.get("servers")
  });
  const rawServers = serversQuery.data;
  const servers = Array.isArray(rawServers) ? rawServers : rawServers?.servers || [];
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
  const summaryQuery = query.useQuery({
    queryKey: ["ext", "players", selectedServerId, "summary"],
    queryFn: () => http.get(`ext/com.kubek.players/servers/${selectedServerId}/summary`),
    enabled: Boolean(selectedServerId),
    refetchInterval: 8e3
  });
  const onlineQuery = query.useQuery({
    queryKey: ["ext", "players", selectedServerId, "online"],
    queryFn: () => http.get(`ext/com.kubek.players/servers/${selectedServerId}/online`),
    enabled: Boolean(selectedServerId),
    refetchInterval: 5e3
  });
  const directoryQuery = query.useQuery({
    queryKey: ["ext", "players", selectedServerId, "directory"],
    queryFn: () => http.get(`ext/com.kubek.players/servers/${selectedServerId}/directory`),
    enabled: Boolean(selectedServerId)
  });
  const summary = summaryQuery.data || {
    whitelistCount: 0,
    opsCount: 0,
    bannedPlayersCount: 0,
    bannedIpsCount: 0
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
  return /* @__PURE__ */ react_default.createElement("div", { className: "p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300" }, /* @__PURE__ */ react_default.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60" }, /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ react_default.createElement("div", { className: "p-2.5 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20" }, /* @__PURE__ */ react_default.createElement(UsersIcon, { className: "w-6 h-6" })), /* @__PURE__ */ react_default.createElement("div", null, /* @__PURE__ */ react_default.createElement("h1", { className: "text-2xl font-black tracking-tight text-foreground" }, t("ext.players.title") || "Players Management"), /* @__PURE__ */ react_default.createElement("p", { className: "text-xs text-muted-foreground" }, t("ext.players.subtitle") || "Manage server access lists, real-time vitals, inventories, and player data.")))), /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center gap-3" }, servers.length > 1 && /* @__PURE__ */ react_default.createElement("div", { className: "flex items-center rounded-xl bg-card border border-border/80 px-3 py-2 shadow-sm" }, /* @__PURE__ */ react_default.createElement(ServerIcon, { className: "w-4 h-4 text-muted-foreground mr-2" }), /* @__PURE__ */ react_default.createElement(
    "select",
    {
      value: selectedServerId,
      onChange: (e) => {
        setSelectedServerId(e.target.value);
        localStorage.setItem("selected_server_id", e.target.value);
      },
      className: "bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
    },
    servers.map((s) => /* @__PURE__ */ react_default.createElement("option", { key: s.id, value: s.id }, s.name, " (", s.status, ")"))
  )), /* @__PURE__ */ react_default.createElement(
    "button",
    {
      type: "button",
      onClick: handleRefreshAll,
      className: "p-2.5 rounded-xl bg-card hover:bg-muted border border-border/80 text-muted-foreground hover:text-foreground transition shadow-sm",
      title: "Refresh telemetry"
    },
    /* @__PURE__ */ react_default.createElement(
      RefreshIcon,
      {
        className: `w-4 h-4 ${onlineQuery.isLoading ? "animate-spin" : ""}`
      }
    )
  ))), !selectedServerId ? /* @__PURE__ */ react_default.createElement("div", { className: "p-12 rounded-3xl border border-border bg-card/40 text-center text-muted-foreground" }, /* @__PURE__ */ react_default.createElement(ServerIcon, { className: "w-10 h-10 mx-auto mb-3 opacity-40 text-muted-foreground" }), /* @__PURE__ */ react_default.createElement("h3", { className: "text-base font-bold text-foreground mb-1" }, "No Server Selected"), /* @__PURE__ */ react_default.createElement("p", { className: "text-xs text-muted-foreground" }, "Please create or select a server to manage its players.")) : /* @__PURE__ */ react_default.createElement(react_default.Fragment, null, /* @__PURE__ */ react_default.createElement(
    CategoryCards,
    {
      summary,
      onOpenCategory: (cat) => setActiveCategory(cat)
    }
  ), /* @__PURE__ */ react_default.createElement(
    OnlinePlayersList,
    {
      onlinePlayers,
      isLoading: onlineQuery.isLoading,
      onSelectPlayer: (uuid) => setSelectedPlayerUuid(uuid)
    }
  ), /* @__PURE__ */ react_default.createElement(
    OfflinePlayersList,
    {
      players: allPlayers,
      isLoading: directoryQuery.isLoading,
      onSelectPlayer: (uuid) => setSelectedPlayerUuid(uuid)
    }
  )), activeCategory && selectedServerId && /* @__PURE__ */ react_default.createElement(
    CategoryListModal,
    {
      serverId: selectedServerId,
      category: activeCategory,
      onClose: () => setActiveCategory(null),
      onChanged: () => {
        summaryQuery.refetch();
        directoryQuery.refetch();
      }
    }
  ), selectedPlayerUuid && selectedServerId && /* @__PURE__ */ react_default.createElement(
    PlayerDetailsModal,
    {
      serverId: selectedServerId,
      uuid: selectedPlayerUuid,
      onClose: () => setSelectedPlayerUuid(null),
      onChanged: () => {
        summaryQuery.refetch();
        onlineQuery.refetch();
        directoryQuery.refetch();
      }
    }
  ));
};

// frontend/src/styles/players.css
if (typeof document !== "undefined") {
  const styleId = "kubek-ext-players-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.setAttribute("data-extension", "com.kubek.players");
    style.textContent = "/* Scoped styles for Kubek Players Management Extension */\n\n.players-pulse-dot {\n  width: 8px;\n  height: 8px;\n  background-color: #10b981;\n  border-radius: 9999px;\n  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);\n  animation: playersPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;\n}\n\n@keyframes playersPulse {\n  0% {\n    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);\n  }\n  70% {\n    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);\n  }\n  100% {\n    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);\n  }\n}\n\n/* 60 / 40 Split Layout */\n.mc-split-container {\n  display: flex !important;\n  flex-direction: column !important;\n  gap: 24px !important;\n  width: 100% !important;\n}\n\n.mc-split-left {\n  width: 100% !important;\n  display: flex !important;\n  flex-direction: column !important;\n  gap: 24px !important;\n}\n\n.mc-split-right {\n  width: 100% !important;\n  display: flex !important;\n  flex-direction: column !important;\n  gap: 24px !important;\n}\n\n@media (min-width: 1024px) {\n  .mc-split-container {\n    flex-direction: row !important;\n    align-items: flex-start !important;\n  }\n\n  .mc-split-left {\n    flex: 0 0 70% !important;\n    width: 70% !important;\n    max-width: 70% !important;\n  }\n\n  .mc-split-right {\n    flex: 0 0 calc(30% - 24px) !important;\n    width: calc(30% - 24px) !important;\n    max-width: calc(30% - 24px) !important;\n  }\n}\n\n/* Vitals & HUD Styles */\n.mc-hud-row {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: space-between !important;\n  gap: 10px !important;\n  background: rgba(24, 24, 27, 0.5) !important;\n  border: 1px solid rgba(255, 255, 255, 0.08) !important;\n  border-radius: 16px !important;\n  padding: 10px 12px !important;\n  transition: all 0.2s ease !important;\n}\n\n.mc-hud-row:hover {\n  background: rgba(24, 24, 27, 0.75) !important;\n  border-color: rgba(255, 255, 255, 0.12) !important;\n}\n\n.mc-icons-grid {\n  display: grid !important;\n  grid-template-columns: repeat(10, 20px) !important;\n  gap: 3px !important;\n  align-items: center !important;\n  justify-items: center !important;\n}\n\n/* Authentic Minecraft Inventory Container & Slots - High Fidelity Unified Grid */\n.mc-inv-container {\n  display: inline-flex !important;\n  flex-direction: column !important;\n  align-items: center !important;\n  justify-content: center !important;\n  gap: 6px !important;\n  background: #c6c6c6 !important;\n  padding: 14px 16px !important;\n  border-top: 4px solid #ffffff !important;\n  border-left: 4px solid #ffffff !important;\n  border-bottom: 4px solid #555555 !important;\n  border-right: 4px solid #555555 !important;\n  border-radius: 0px !important;\n  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4) !important;\n  box-sizing: border-box !important;\n}\n\n.mc-slot {\n  width: 54px !important;\n  height: 54px !important;\n  min-width: 54px !important;\n  min-height: 54px !important;\n  background: #8b8b8b !important;\n  border-top: 3px solid #373737 !important;\n  border-left: 3px solid #373737 !important;\n  border-bottom: 3px solid #ffffff !important;\n  border-right: 3px solid #ffffff !important;\n  border-radius: 0px !important;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  position: relative !important;\n  box-sizing: border-box !important;\n  image-rendering: pixelated !important;\n  transition: background 0.1s ease !important;\n}\n\n.mc-slot:hover {\n  background: #a0a0a0 !important;\n  outline: 2px solid #ffffff !important;\n  z-index: 10 !important;\n}\n\n.mc-slot-filled {\n  background: #8b8b8b !important;\n}\n\n.mc-slot-item-img {\n  width: 40px !important;\n  height: 40px !important;\n  object-fit: contain !important;\n  image-rendering: pixelated !important;\n}\n\n.image-pixelated {\n  image-rendering: pixelated !important;\n  image-rendering: -moz-crisp-edges !important;\n  image-rendering: crisp-edges !important;\n}\n\n.mc-slot-item-text {\n  font-size: 9px !important;\n  font-weight: 800 !important;\n  text-align: center !important;\n  line-height: 1 !important;\n  color: #ffffff !important;\n  text-shadow: 1px 1px 0 #000 !important;\n  word-break: break-all !important;\n  padding: 1px !important;\n}\n\n.mc-slot-count {\n  position: absolute !important;\n  bottom: 2px !important;\n  right: 3px !important;\n  font-family: monospace !important;\n  font-size: 13px !important;\n  font-weight: 900 !important;\n  color: #ffffff !important;\n  text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000 !important;\n  pointer-events: none !important;\n}\n\n.mc-ender-grid {\n  display: grid !important;\n  grid-template-columns: repeat(9, 54px) !important;\n  grid-template-rows: repeat(3, 54px) !important;\n  gap: 4px !important;\n}\n\n/* XP Bar */\n.mc-bar-bg {\n  width: 100% !important;\n  height: 8px !important;\n  background: #18181b !important;\n  border: 1px solid #27272a !important;\n  border-radius: 9999px !important;\n  overflow: hidden !important;\n  position: relative !important;\n}\n\n.mc-bar-xp {\n  height: 100% !important;\n  background: linear-gradient(90deg, #10b981, #34d399, #6ee7b7) !important;\n  border-radius: 9999px !important;\n  box-shadow: 0 0 10px rgba(16, 185, 129, 0.6) !important;\n  transition: width 0.4s ease !important;\n}\n\n/* Position Axis Boxes */\n.coord-box {\n  background: rgba(24, 24, 27, 0.6) !important;\n  border: 1px solid rgba(255, 255, 255, 0.08) !important;\n  border-radius: 14px !important;\n  padding: 10px 8px !important;\n  text-align: center !important;\n  transition: border-color 0.2s ease !important;\n}\n\n.coord-box:hover {\n  border-color: rgba(255, 255, 255, 0.2) !important;\n}\n\n/* Stats Grids */\n.mc-stats-grid-4 {\n  display: grid !important;\n  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)) !important;\n  gap: 12px !important;\n}\n\n.mc-stats-grid-3 {\n  display: grid !important;\n  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;\n  gap: 12px !important;\n}\n\n.mc-purge-grid {\n  display: grid !important;\n  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)) !important;\n  gap: 10px !important;\n}\n";
    document.head.appendChild(style);
  }
}

// frontend/src/index.ts
function patchSidebarIcon() {
  if (typeof document === "undefined") return;
  const replaceIcon = () => {
    const elements = document.querySelectorAll('a, button, [role="button"], div, li');
    elements.forEach((el) => {
      const href = el.getAttribute("href") || "";
      const text = (el.textContent || "").trim();
      if (href.includes("com.kubek.players") || href.includes("PlayersDashboard") || text.startsWith("Players") && text.length <= 15) {
        const svg = el.querySelector("svg");
        if (svg && svg.getAttribute("data-kubek-icon") !== "users") {
          svg.setAttribute("data-kubek-icon", "users");
          svg.setAttribute("viewBox", "0 0 24 24");
          svg.setAttribute("fill", "none");
          svg.setAttribute("stroke", "currentColor");
          svg.setAttribute("stroke-width", "2");
          svg.setAttribute("stroke-linecap", "round");
          svg.setAttribute("stroke-linejoin", "round");
          svg.innerHTML = '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path>';
        }
      }
    });
  };
  replaceIcon();
  if (typeof MutationObserver !== "undefined" && document.body) {
    const observer = new MutationObserver(() => {
      replaceIcon();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", patchSidebarIcon);
  } else {
    patchSidebarIcon();
  }
}
var frontendModule = {
  components: {
    PlayersDashboard
  }
};
var index_default = frontendModule;
export {
  index_default as default
};
