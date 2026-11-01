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

// frontend/src/ui/cx.ts
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

// frontend/src/ui/empty.tsx
var Empty = ({
  className,
  children
}) => /* @__PURE__ */ react_default.createElement("div", { className: cx("k-empty", className) }, children);
var EmptyHeader = ({
  className,
  children
}) => /* @__PURE__ */ react_default.createElement("div", { className: cx("k-empty-header", className) }, children);
var EmptyMedia = ({
  icon,
  className
}) => /* @__PURE__ */ react_default.createElement("div", { className: cx("k-empty-media", className) }, icon);
var EmptyTitle = ({
  className,
  children
}) => /* @__PURE__ */ react_default.createElement("div", { className: cx("k-empty-title", className) }, children);
var EmptyDescription = ({
  className,
  children
}) => /* @__PURE__ */ react_default.createElement("div", { className: cx("k-empty-description", className) }, children);

// frontend/src/ui/kubek.ts
function useKubek() {
  return typeof window === "undefined" ? void 0 : window.Kubek;
}

// frontend/src/ui/page-header.tsx
var PageHeader = ({ title, description, actions, className }) => /* @__PURE__ */ react_default.createElement("div", { className: cx("k-page-header", className) }, /* @__PURE__ */ react_default.createElement("div", { className: "k-page-header-text" }, /* @__PURE__ */ react_default.createElement("h1", null, title), description ? /* @__PURE__ */ react_default.createElement("p", null, description) : null), actions ? /* @__PURE__ */ react_default.createElement("div", { className: "k-page-header-actions" }, actions) : null);

// frontend/src/ui/panel.tsx
var Panel = ({ className, children, ...rest }) => /* @__PURE__ */ react_default.createElement("section", { className: cx("k-panel", className), ...rest }, children);
var PanelHead = ({ className, children, ...rest }) => /* @__PURE__ */ react_default.createElement("div", { className: cx("k-panel-head", className), ...rest }, children);
var PanelMeta = ({ className, children, ...rest }) => /* @__PURE__ */ react_default.createElement("span", { className: cx("k-panel-meta", className), ...rest }, children);
var PanelBody = ({ className, children, ...rest }) => /* @__PURE__ */ react_default.createElement("div", { className: cx("k-panel-body", className), ...rest }, children);
var PanelFoot = ({ className, children, ...rest }) => /* @__PURE__ */ react_default.createElement("div", { className: cx("k-panel-foot", className), ...rest }, children);

// frontend/src/ui/tone.ts
var toneClass = {
  green: "k-tone-green",
  blue: "k-tone-blue",
  purple: "k-tone-purple",
  amber: "k-tone-amber",
  pink: "k-tone-pink",
  cyan: "k-tone-cyan",
  red: "k-tone-red",
  orange: "k-tone-orange",
  gray: "k-tone-gray",
  primary: "k-tone-primary"
};

// frontend/src/ui/plate.tsx
var Plate = ({ tone = "primary", size = "md", className, children }) => /* @__PURE__ */ react_default.createElement("span", { className: cx("k-plate", `k-plate-${size}`, toneClass[tone], className) }, children);

// frontend/src/ui/stat-strip.tsx
var StatStrip = ({
  className,
  children
}) => /* @__PURE__ */ react_default.createElement("div", { className: cx("k-strip", className) }, children);
var Stat = ({ label, value, unit, icon, tone = "primary", onClick, className }) => {
  const content = /* @__PURE__ */ react_default.createElement(react_default.Fragment, null, /* @__PURE__ */ react_default.createElement("span", { className: "k-stat-label" }, /* @__PURE__ */ react_default.createElement("span", null, label), icon ? /* @__PURE__ */ react_default.createElement(Plate, { tone, size: "sm" }, icon) : null), /* @__PURE__ */ react_default.createElement("span", { className: "k-stat-value" }, value, unit ? /* @__PURE__ */ react_default.createElement("small", { className: "k-stat-unit" }, unit) : null));
  if (onClick) {
    return /* @__PURE__ */ react_default.createElement("button", { type: "button", className: cx("k-stat", "k-stat-clickable", className), onClick }, content);
  }
  return /* @__PURE__ */ react_default.createElement("div", { className: cx("k-stat", className) }, content);
};

// frontend/src/ui/tabs.tsx
var TabBar = ({ items, value, onChange, label, compact, className }) => /* @__PURE__ */ react_default.createElement("div", { role: "tablist", "aria-label": label, className: cx("k-tabs", compact && "k-tabs-sm", className) }, items.map((item) => {
  const active = item.id === value;
  return /* @__PURE__ */ react_default.createElement(
    "button",
    {
      key: item.id,
      type: "button",
      role: "tab",
      "aria-selected": active,
      className: cx("k-tab", active && "k-tab-active"),
      onClick: () => onChange(item.id)
    },
    item.icon ? /* @__PURE__ */ react_default.createElement("span", { className: "k-tab-icon" }, item.icon) : null,
    /* @__PURE__ */ react_default.createElement("span", null, item.label),
    item.count ? /* @__PURE__ */ react_default.createElement("span", { className: "k-tab-count" }, item.count) : null
  );
}));

// frontend/src/ui/toast.tsx
var ToastContext = react_default.createContext({
  notify: () => {
  }
});
function useToast() {
  return react_default.useContext(ToastContext);
}
var ToastItem = ({ toast }) => /* @__PURE__ */ react_default.createElement(
  "div",
  {
    className: cx("k-toast", `k-toast-${toast.type}`),
    "data-variant": toast.type,
    role: toast.type === "error" ? "alert" : "status"
  },
  /* @__PURE__ */ react_default.createElement("div", { className: "k-toast-text" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-toast-title" }, toast.title), toast.description ? /* @__PURE__ */ react_default.createElement("div", { className: "k-toast-description" }, toast.description) : null)
);
var ToastProvider = ({ children }) => {
  const [toasts, setToasts] = react_default.useState([]);
  const notify = react_default.useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [...current.slice(-2), { ...toast, id }]);
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 4e3);
    }
  }, []);
  return /* @__PURE__ */ react_default.createElement(ToastContext.Provider, { value: { notify } }, children, /* @__PURE__ */ react_default.createElement("div", { className: "k-toasts", role: "region", "aria-label": "Notifications" }, toasts.map((toast) => /* @__PURE__ */ react_default.createElement(ToastItem, { key: toast.id, toast }))));
};

// frontend/src/utils/format.ts
var TEXTURE_BASE = "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.9/assets/minecraft/textures";
function matchesQuery(query, ...fields) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((field) => field?.toLowerCase().includes(q));
}
function itemTextureUrls(id) {
  const clean = id.replace(/^[a-z0-9_]+:/i, "");
  return {
    item: `${TEXTURE_BASE}/item/${clean}.png`,
    block: `${TEXTURE_BASE}/block/${clean}.png`
  };
}
function formatCoordinate(value) {
  return Number.isFinite(value) ? value.toFixed(1) : "\u2014";
}

// frontend/src/ui/search-input.tsx
var SearchInput = ({ value, onChange, placeholder, label }) => /* @__PURE__ */ react_default.createElement("label", { className: "k-search" }, /* @__PURE__ */ react_default.createElement("svg", { className: "k-search-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", "aria-hidden": "true" }, /* @__PURE__ */ react_default.createElement("circle", { cx: "11", cy: "11", r: "7" }), /* @__PURE__ */ react_default.createElement("path", { d: "m20 20-3.5-3.5", strokeLinecap: "round" })), /* @__PURE__ */ react_default.createElement(
  "input",
  {
    className: "k-search-input",
    type: "search",
    value,
    placeholder,
    "aria-label": label,
    onChange: (event) => onChange(event.target.value)
  }
));

// frontend/src/ui/head-face.ts
var SKIN = ["#c98f62", "#e3b08a", "#8a5a3c", "#f0c9a4", "#b07850"];
var HAIR = ["#3a2618", "#6b4423", "#d9b54a", "#1d1d22", "#8c2f22", "#cfcfcf", "#4a3a8c"];
var EYE = ["#3b5bdb", "#2f7d4f", "#6b3e1f", "#444"];
var SHADE = "rgba(0,0,0,.18)";
var cache = /* @__PURE__ */ new Map();
var hashName = (name) => [...name].reduce((h, c) => h * 31 + c.charCodeAt(0) >>> 0, 7);
function generatedFacePixels(name) {
  const cached = cache.get(name);
  if (cached) return cached;
  const h = hashName(name);
  const pick = (list, shift) => list[(h >> shift) % list.length];
  const skin = pick(SKIN, 1);
  const hair = pick(HAIR, 4);
  const eye = pick(EYE, 8);
  const fringe = (h >> 11) % 3;
  const mouth = (h >> 13) % 2 ? "#7a3f2a" : SHADE;
  const pixels = [
    [0, 0, 8, 8, skin],
    [0, 0, 8, fringe === 2 ? 3 : 2, hair],
    [1, 4, 2, 1, "#fff"],
    [5, 4, 2, 1, "#fff"],
    [2, 4, 1, 1, eye],
    [5, 4, 1, 1, eye],
    [3, 5, 2, 1, SHADE],
    [2, 6, 4, 1, mouth]
  ];
  if (fringe === 1) pixels.splice(2, 0, [0, 2, 1, 2, hair], [7, 2, 1, 2, hair]);
  cache.set(name, pixels);
  return pixels;
}

// frontend/src/ui/player-head.tsx
var VALID_NAME = /^[A-Za-z0-9_]{1,16}$/;
var PlayerHead = ({ name, size = 32, className }) => {
  const [failed, setFailed] = react_default.useState(false);
  if (!VALID_NAME.test(name) || failed) {
    return /* @__PURE__ */ react_default.createElement(
      "svg",
      {
        viewBox: "0 0 8 8",
        width: size,
        height: size,
        shapeRendering: "crispEdges",
        role: "img",
        "aria-label": name,
        className: cx("k-head", className)
      },
      generatedFacePixels(name).map(([x, y, w, h, fill], index) => /* @__PURE__ */ react_default.createElement("rect", { key: index, x, y, width: w, height: h, fill }))
    );
  }
  return /* @__PURE__ */ react_default.createElement(
    "img",
    {
      src: `/api/heads/${encodeURIComponent(name)}`,
      alt: "",
      title: name,
      width: size,
      height: size,
      loading: "lazy",
      decoding: "async",
      draggable: false,
      onError: () => setFailed(true),
      className: cx("k-head", "k-head-pixel", className)
    }
  );
};

// frontend/src/components/player/PlayerRow.tsx
var PlayerRow = ({ name, uuid, head, badges, detail, actions, onOpen }) => {
  const onKeyDown = (event) => {
    if (!onOpen) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };
  return /* @__PURE__ */ react_default.createElement(
    "div",
    {
      className: cx("k-row", onOpen && "k-row-clickable"),
      role: onOpen ? "button" : void 0,
      tabIndex: onOpen ? 0 : void 0,
      onClick: onOpen,
      onKeyDown
    },
    head ?? /* @__PURE__ */ react_default.createElement(PlayerHead, { name, size: 32, className: "k-row-head" }),
    /* @__PURE__ */ react_default.createElement("div", { className: "k-row-main" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-row-title" }, /* @__PURE__ */ react_default.createElement("span", { className: "k-row-name" }, name), badges), uuid !== void 0 ? /* @__PURE__ */ react_default.createElement("div", { className: "k-row-uuid" }, /* @__PURE__ */ react_default.createElement("span", { className: "k-row-uuid-text" }, uuid || "\u2014"), uuid ? /* @__PURE__ */ react_default.createElement(
      "button",
      {
        type: "button",
        className: "k-row-copy",
        "aria-label": "Copy UUID",
        title: "Copy UUID",
        onClick: (event) => {
          event.stopPropagation();
          void navigator.clipboard?.writeText(uuid);
        }
      },
      /* @__PURE__ */ react_default.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", "aria-hidden": "true" }, /* @__PURE__ */ react_default.createElement("rect", { x: "9", y: "9", width: "11", height: "11", rx: "2" }), /* @__PURE__ */ react_default.createElement("path", { d: "M5 15V5a2 2 0 0 1 2-2h10" }))
    ) : null) : null, detail ? /* @__PURE__ */ react_default.createElement("div", { className: "k-row-detail" }, detail) : null),
    actions ? /* @__PURE__ */ react_default.createElement("div", { className: "k-row-actions", onClick: (event) => event.stopPropagation() }, actions) : null
  );
};

// frontend/src/components/tabs/AllPlayersTab.tsx
var AllPlayersTab = ({ players, isLoading, emptyIcon, onSelectPlayer }) => {
  const kubek = useKubek();
  const { t } = kubek?.hooks?.useTranslation?.() ?? { t: (key) => key };
  const [query, setQuery] = react_default.useState("");
  const sorted = react_default.useMemo(() => {
    const copy = [...players];
    copy.sort((a, b) => {
      if (Boolean(a.isOnline) !== Boolean(b.isOnline)) return a.isOnline ? -1 : 1;
      return String(a.username).localeCompare(String(b.username));
    });
    return copy;
  }, [players]);
  const rows = sorted.filter((player) => matchesQuery(query, player.username, player.uuid));
  const Badge = kubek?.ui?.Badge;
  const ArrowRight = kubek?.icons?.ArrowRight || (() => null);
  const UsersIcon = kubek?.icons?.Users || (() => null);
  return /* @__PURE__ */ react_default.createElement(Panel, null, /* @__PURE__ */ react_default.createElement(PanelHead, null, /* @__PURE__ */ react_default.createElement(PanelMeta, null, players.length, " players"), players.length > 0 ? /* @__PURE__ */ react_default.createElement("div", { className: "k-panel-search" }, /* @__PURE__ */ react_default.createElement(
    SearchInput,
    {
      value: query,
      onChange: setQuery,
      placeholder: t("ext.players.search") || "Search players",
      label: t("ext.players.search") || "Search players"
    }
  )) : null), isLoading ? /* @__PURE__ */ react_default.createElement("div", { className: "k-skeleton", "aria-busy": "true" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-skeleton-row" }), /* @__PURE__ */ react_default.createElement("div", { className: "k-skeleton-row" }), /* @__PURE__ */ react_default.createElement("div", { className: "k-skeleton-row" })) : rows.length === 0 ? /* @__PURE__ */ react_default.createElement(Empty, null, /* @__PURE__ */ react_default.createElement(EmptyHeader, null, /* @__PURE__ */ react_default.createElement(EmptyMedia, { icon: emptyIcon ?? /* @__PURE__ */ react_default.createElement(UsersIcon, null) }), /* @__PURE__ */ react_default.createElement(EmptyTitle, null, players.length === 0 ? t("ext.players.no_players") : t("ext.players.no_matches")), /* @__PURE__ */ react_default.createElement(EmptyDescription, null, players.length === 0 ? t("ext.players.no_players_hint") : t("ext.players.no_matches_hint")))) : /* @__PURE__ */ react_default.createElement("div", { className: "k-rows" }, rows.map((player) => {
    const key = player.uuid || player.username;
    return /* @__PURE__ */ react_default.createElement(
      PlayerRow,
      {
        key,
        name: player.username,
        uuid: player.uuid,
        badges: player.isOnline ? Badge ? /* @__PURE__ */ react_default.createElement(Badge, { variant: "success" }, t("ext.players.online")) : /* @__PURE__ */ react_default.createElement("span", { className: "k-badge" }, t("ext.players.online")) : null,
        detail: player.lastSeen || void 0,
        onOpen: onSelectPlayer ? () => onSelectPlayer(key) : void 0,
        actions: onSelectPlayer ? /* @__PURE__ */ react_default.createElement(
          "button",
          {
            type: "button",
            className: "k-icon-btn",
            title: t("ext.players.details"),
            "aria-label": t("ext.players.details"),
            onClick: () => onSelectPlayer(key)
          },
          /* @__PURE__ */ react_default.createElement(ArrowRight, null)
        ) : void 0
      }
    );
  })));
};

// frontend/src/ui/dialog.tsx
var DialogSurface = ({
  onClose,
  label,
  width = 480,
  children,
  className
}) => {
  const ref = react_default.useRef(null);
  const restoreRef = react_default.useRef(null);
  react_default.useEffect(() => {
    restoreRef.current = document.activeElement;
    ref.current?.focus();
    return () => {
      const previous = restoreRef.current;
      previous?.focus?.();
    };
  }, []);
  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const root = ref.current;
    if (!root) return;
    const nodes = Array.from(
      root.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.offsetParent !== null || element === document.activeElement);
    if (nodes.length === 0) {
      event.preventDefault();
      return;
    }
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (!event.shiftKey) {
      if (!active || !root.contains(active) || active === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (!active || active === root || active === first || !root.contains(active)) {
      event.preventDefault();
      last.focus();
    }
  };
  return /* @__PURE__ */ react_default.createElement(
    "div",
    {
      className: "k-dialog-overlay",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) onClose();
      }
    },
    /* @__PURE__ */ react_default.createElement(
      "div",
      {
        ref,
        role: "dialog",
        "aria-modal": "true",
        "aria-label": label,
        tabIndex: -1,
        className: cx("k-dialog", className),
        style: { ["--k-dialog-width"]: `${width}px` },
        onKeyDown
      },
      children
    )
  );
};
var Dialog = ({
  open,
  onClose,
  label,
  width,
  children,
  className
}) => {
  react_default.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  if (!open) return null;
  return /* @__PURE__ */ react_default.createElement(DialogSurface, { onClose, label, width, className }, children);
};
var DialogHeader = ({ title, description, leading, actions }) => /* @__PURE__ */ react_default.createElement("header", { className: "k-dialog-header" }, leading, /* @__PURE__ */ react_default.createElement("div", { className: "k-dialog-heading" }, /* @__PURE__ */ react_default.createElement("h2", null, title), description ? /* @__PURE__ */ react_default.createElement("p", null, description) : null), actions ? /* @__PURE__ */ react_default.createElement("div", { className: "k-dialog-actions" }, actions) : null);
var DialogBody = ({
  className,
  children
}) => /* @__PURE__ */ react_default.createElement("div", { className: cx("k-dialog-body", className) }, children);
var DialogFooter = ({
  className,
  children
}) => /* @__PURE__ */ react_default.createElement("footer", { className: cx("k-dialog-footer", className) }, children);

// frontend/src/utils/errors.ts
function getMutationErrorMessage(error) {
  const err = error;
  const response = err?.response;
  if (response && typeof response.json === "function") {
    return Promise.resolve().then(() => response.json()).then((body) => {
      if (typeof body?.error === "string") return body.error;
      if (typeof body?.message === "string") return body.message;
      return generic(err);
    }).catch(() => generic(err));
  }
  return Promise.resolve(generic(err));
}
function generic(err) {
  if (typeof err?.message === "string" && err.message) return err.message;
  return "The action failed. Check that the server is running and try again.";
}

// frontend/src/components/modals/TeleportModal.tsx
var TeleportModal = ({ serverId, uuid, username, isOnline = true, currentLocation, onClose, onSuccess }) => {
  const kubek = useKubek();
  const { ui, icons = {}, http, query, hooks } = kubek;
  const { t } = hooks.useTranslation();
  const { notify } = useToast();
  const [world, setWorld] = react_default.useState(currentLocation?.world || "minecraft:overworld");
  const [x, setX] = react_default.useState(currentLocation?.x ?? 0);
  const [y, setY] = react_default.useState(currentLocation?.y ?? 64);
  const [z, setZ] = react_default.useState(currentLocation?.z ?? 0);
  const Sparkles = icons.Sparkles || (() => null);
  const XIcon = icons.X || (() => null);
  const teleport = query.useMutation({
    mutationFn: (body) => http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/teleport`, body),
    onSuccess: (data) => {
      notify({
        type: "success",
        title: data?.message || (isOnline ? t("ext.players.teleported") || "Player teleported" : t("ext.players.player_data_saved") || "Player data saved")
      });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      void getMutationErrorMessage(error).then(
        (message) => notify({ type: "error", title: message })
      );
    }
  });
  const submit = (event) => {
    event.preventDefault();
    teleport.mutate({ world, x: Number(x), y: Number(y), z: Number(z) });
  };
  const dimensions = [
    { value: "minecraft:overworld", label: "Overworld" },
    { value: "minecraft:the_nether", label: "The Nether" },
    { value: "minecraft:the_end", label: "The End" }
  ];
  const coordinates = [
    { axis: "X", value: x, set: setX },
    { axis: "Y", value: y, set: setY },
    { axis: "Z", value: z, set: setZ }
  ];
  return /* @__PURE__ */ react_default.createElement(Dialog, { open: true, onClose, label: t("ext.players.teleport") || "Teleport", width: 480 }, /* @__PURE__ */ react_default.createElement("form", { className: "k-dialog-form", onSubmit: submit }, /* @__PURE__ */ react_default.createElement(
    DialogHeader,
    {
      title: `${isOnline ? "Teleport" : "Change position"} \xB7 ${username}`,
      description: "Pick the target world and coordinates.",
      actions: /* @__PURE__ */ react_default.createElement(ui.Button, { variant: "ghost", size: "icon-sm", type: "button", onClick: onClose, "aria-label": "Close" }, /* @__PURE__ */ react_default.createElement(XIcon, null))
    }
  ), /* @__PURE__ */ react_default.createElement(DialogBody, null, !isOnline ? /* @__PURE__ */ react_default.createElement("p", { className: "k-danger-note" }, username, " is offline. The position is written to their player data and applied the next time they join.") : null, /* @__PURE__ */ react_default.createElement("label", { className: "k-field" }, /* @__PURE__ */ react_default.createElement("span", { className: "k-field-label" }, t("ext.players.dimension") || "Dimension"), /* @__PURE__ */ react_default.createElement(
    "select",
    {
      className: "k-select k-select-full",
      value: world,
      onChange: (event) => setWorld(event.target.value)
    },
    dimensions.map((dimension) => /* @__PURE__ */ react_default.createElement("option", { key: dimension.value, value: dimension.value }, dimension.label))
  )), /* @__PURE__ */ react_default.createElement("div", { className: "k-coords", style: { gridTemplateColumns: "repeat(3, minmax(0,1fr))" } }, coordinates.map((entry) => /* @__PURE__ */ react_default.createElement("label", { key: entry.axis, className: "k-field" }, /* @__PURE__ */ react_default.createElement("span", { className: "k-field-label k-field-label-center" }, entry.axis), /* @__PURE__ */ react_default.createElement(
    ui.Input,
    {
      className: "k-coord-input",
      type: "number",
      step: "any",
      value: entry.value,
      onChange: (event) => entry.set(Number.parseFloat(event.target.value) || 0)
    }
  ))))), /* @__PURE__ */ react_default.createElement(DialogFooter, null, /* @__PURE__ */ react_default.createElement(ui.Button, { variant: "outline", type: "button", onClick: onClose }, t("ext.players.cancel") || "Cancel"), /* @__PURE__ */ react_default.createElement(ui.Button, { type: "submit", disabled: teleport.isPending }, /* @__PURE__ */ react_default.createElement(Sparkles, null), isOnline ? t("ext.players.teleport") || "Teleport" : t("ext.players.change_position") || "Change position"))));
};

// frontend/src/ui/switch.tsx
var Switch = ({ checked, onChange, disabled, label }) => /* @__PURE__ */ react_default.createElement(
  "button",
  {
    type: "button",
    role: "switch",
    "aria-checked": checked,
    "aria-label": label,
    disabled,
    className: cx("k-switch", checked && "k-switch-on"),
    onClick: () => onChange(!checked)
  },
  /* @__PURE__ */ react_default.createElement("span", { className: "k-switch-thumb" })
);

// frontend/src/components/GamemodeSelect.tsx
var MODES = ["Survival", "Creative", "Adventure", "Spectator"];
var GamemodeSelect = ({ value, onChange, disabled }) => {
  const current = MODES.find((mode) => mode.toLowerCase() === (value || "survival").toLowerCase()) || MODES[0];
  return /* @__PURE__ */ react_default.createElement(
    "select",
    {
      className: "k-select",
      value: current,
      disabled,
      "aria-label": "Game mode",
      onChange: (event) => onChange(event.target.value)
    },
    MODES.map((mode) => /* @__PURE__ */ react_default.createElement("option", { key: mode, value: mode }, mode))
  );
};

// frontend/src/components/player/sections/Access.tsx
var Access = ({ serverId, uuid, player, onChanged, onRefetch }) => {
  const kubek = useKubek();
  const { http, query, hooks, icons = {} } = kubek;
  const { t } = hooks.useTranslation();
  const { notify } = useToast();
  const Shield = icons.Shield || icons.UserCheck || (() => null);
  const permissionMutation = query.useMutation({
    mutationFn: (body) => http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/permissions`, body),
    onSuccess: () => {
      onRefetch();
      onChanged();
    },
    onError: (error) => {
      void getMutationErrorMessage(error).then(
        (message) => notify({ type: "error", title: message })
      );
    }
  });
  const gamemodeMutation = query.useMutation({
    mutationFn: (gamemode) => http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/gamemode`, { gamemode }),
    onSuccess: () => {
      onRefetch();
      onChanged();
    },
    onError: (error) => {
      void getMutationErrorMessage(error).then(
        (message) => notify({ type: "error", title: message })
      );
    }
  });
  const permissions = player.permissions;
  const pending = permissionMutation.isPending;
  const rows = [
    {
      perm: "whitelist",
      label: t("ext.players.whitelisted") || "Whitelisted",
      hint: "Allowed to join when the whitelist is enforced.",
      value: permissions?.isWhitelisted
    },
    {
      perm: "op",
      label: t("ext.players.operator") || "Operator",
      hint: "Granted operator permissions on this server.",
      value: permissions?.isOp
    },
    {
      perm: "ban",
      label: t("ext.players.banned") || "Banned",
      hint: "Blocked from joining this server.",
      value: permissions?.isBanned
    }
  ];
  return /* @__PURE__ */ react_default.createElement(Panel, null, /* @__PURE__ */ react_default.createElement(PanelHead, null, /* @__PURE__ */ react_default.createElement(Plate, { tone: "gray", size: "sm" }, /* @__PURE__ */ react_default.createElement(Shield, null)), /* @__PURE__ */ react_default.createElement("span", { className: "k-section-title" }, "Access")), /* @__PURE__ */ react_default.createElement(PanelBody, null, /* @__PURE__ */ react_default.createElement("div", { className: "k-access" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-access-row" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-access-text" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-access-label" }, "Game mode"), /* @__PURE__ */ react_default.createElement("div", { className: "k-access-hint" }, "Applied immediately while the player is online.")), /* @__PURE__ */ react_default.createElement(
    GamemodeSelect,
    {
      value: player.gamemode || "Survival",
      disabled: !player.summary.isOnline || gamemodeMutation.isPending,
      onChange: (mode) => gamemodeMutation.mutate(mode)
    }
  )), rows.map((row) => /* @__PURE__ */ react_default.createElement("div", { key: row.perm, className: "k-access-row" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-access-text" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-access-label" }, row.label), /* @__PURE__ */ react_default.createElement("div", { className: "k-access-hint" }, row.hint)), row.value === void 0 ? /* @__PURE__ */ react_default.createElement("span", { className: "k-badge" }, "Unknown") : /* @__PURE__ */ react_default.createElement(
    Switch,
    {
      checked: row.value,
      disabled: pending,
      label: row.label,
      onChange: (next) => permissionMutation.mutate({ perm: row.perm, value: next })
    }
  ))))));
};

// frontend/src/components/player/sections/DangerZone.tsx
var EMPTY = {
  playerDataFile: false,
  statisticsFile: false,
  advancementsFile: false
};
var DangerZone = ({
  serverId,
  uuid,
  player,
  onChanged,
  onRefetch
}) => {
  const kubek = useKubek();
  const { http, query, hooks, icons = {}, ui } = kubek;
  const { t } = hooks.useTranslation();
  const { notify } = useToast();
  const Trash = icons.Trash2 || (() => null);
  const UserX = icons.UserX || icons.User || (() => null);
  const [options, setOptions] = react_default.useState(EMPTY);
  const [confirming, setConfirming] = react_default.useState(false);
  const online = player.summary.isOnline;
  const anySelected = Object.values(options).some(Boolean);
  const purgeMutation = query.useMutation({
    mutationFn: (body) => http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/purge`, body),
    onSuccess: () => {
      setConfirming(false);
      setOptions(EMPTY);
      onRefetch();
      onChanged();
      notify({
        type: "success",
        title: t("ext.players.purge_done") || "Player data deleted"
      });
    },
    onError: (error) => {
      void getMutationErrorMessage(error).then(
        (message) => notify({ type: "error", title: message })
      );
    }
  });
  const kickMutation = query.useMutation({
    mutationFn: () => http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/kick`),
    onSuccess: () => {
      onRefetch();
      onChanged();
      notify({ type: "success", title: t("ext.players.kicked") || "Player kicked" });
    },
    onError: (error) => {
      void getMutationErrorMessage(error).then(
        (message) => notify({ type: "error", title: message })
      );
    }
  });
  const toggle = (key) => setOptions((current) => ({ ...current, [key]: !current[key] }));
  const toggleAll = () => {
    const next = !Object.values(options).every(Boolean);
    setOptions({
      playerDataFile: next,
      statisticsFile: next,
      advancementsFile: next
    });
  };
  const labels = [
    { key: "playerDataFile", label: "Player data (.dat: XP, inventory, position)" },
    { key: "statisticsFile", label: "Statistics file" },
    { key: "advancementsFile", label: "Advancements file" }
  ];
  return /* @__PURE__ */ react_default.createElement(Panel, { className: "k-tone-red k-danger" }, /* @__PURE__ */ react_default.createElement(PanelHead, null, /* @__PURE__ */ react_default.createElement(Plate, { tone: "red", size: "sm" }, /* @__PURE__ */ react_default.createElement(Trash, null)), /* @__PURE__ */ react_default.createElement("span", { className: "k-section-title k-danger-title" }, t("ext.players.purge_data") || "Delete player data")), /* @__PURE__ */ react_default.createElement(PanelBody, null, /* @__PURE__ */ react_default.createElement("div", { className: "k-danger-options" }, labels.map((entry) => /* @__PURE__ */ react_default.createElement("label", { key: entry.key, className: "k-check-row" }, /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "checkbox",
      className: "k-check",
      checked: options[entry.key],
      onChange: () => toggle(entry.key)
    }
  ), /* @__PURE__ */ react_default.createElement("span", null, entry.label))), /* @__PURE__ */ react_default.createElement("label", { className: "k-check-row k-check-all" }, /* @__PURE__ */ react_default.createElement(
    "input",
    {
      type: "checkbox",
      className: "k-check",
      checked: Object.values(options).every(Boolean),
      onChange: toggleAll
    }
  ), /* @__PURE__ */ react_default.createElement("span", null, "Select all categories"))), online ? /* @__PURE__ */ react_default.createElement("p", { className: "k-danger-note" }, "The player is online. Data can only be purged after they disconnect.") : null), /* @__PURE__ */ react_default.createElement(PanelFoot, null, /* @__PURE__ */ react_default.createElement(
    ui.Button,
    {
      variant: "destructive",
      size: "sm",
      disabled: !anySelected || online || purgeMutation.isPending,
      onClick: () => setConfirming(true)
    },
    /* @__PURE__ */ react_default.createElement(Trash, null),
    t("ext.players.confirm_purge") || "Delete data"
  ), /* @__PURE__ */ react_default.createElement(
    ui.Button,
    {
      variant: "outline",
      size: "sm",
      disabled: !online || kickMutation.isPending,
      onClick: () => kickMutation.mutate()
    },
    /* @__PURE__ */ react_default.createElement(UserX, null),
    t("ext.players.kick") || "Kick"
  )), /* @__PURE__ */ react_default.createElement(
    Dialog,
    {
      open: confirming,
      onClose: () => setConfirming(false),
      label: "Confirm purge",
      width: 480
    },
    /* @__PURE__ */ react_default.createElement(
      DialogHeader,
      {
        title: "Delete player data?",
        description: `This cannot be undone for ${player.summary.username}.`
      }
    ),
    /* @__PURE__ */ react_default.createElement(DialogBody, null, /* @__PURE__ */ react_default.createElement("ul", { className: "k-danger-list" }, labels.filter((entry) => options[entry.key]).map((entry) => /* @__PURE__ */ react_default.createElement("li", { key: entry.key }, entry.label)))),
    /* @__PURE__ */ react_default.createElement(DialogFooter, null, /* @__PURE__ */ react_default.createElement(ui.Button, { variant: "outline", onClick: () => setConfirming(false) }, t("ext.players.cancel") || "Cancel"), /* @__PURE__ */ react_default.createElement(
      ui.Button,
      {
        variant: "destructive",
        disabled: purgeMutation.isPending,
        onClick: () => purgeMutation.mutate(options)
      },
      t("ext.players.confirm_purge") || "Delete data"
    ))
  ));
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

// frontend/src/components/player/ItemSlot.tsx
var ItemSlot = ({ item, placeholder }) => {
  const [stage, setStage] = react_default.useState(0);
  react_default.useEffect(() => {
    setStage(0);
  }, [item?.id]);
  if (!item) {
    return /* @__PURE__ */ react_default.createElement("div", { className: "k-slot", "aria-label": "Empty", title: "Empty" }, placeholder ? /* @__PURE__ */ react_default.createElement("span", { className: "k-slot-placeholder" }, placeholder) : null);
  }
  const cleanId = (item.id || "").replace(/^[a-z0-9_]+:/i, "");
  const urls = itemTextureUrls(item.id || "");
  const label = item.displayName || cleanId;
  const count = item.count || 1;
  return /* @__PURE__ */ react_default.createElement(
    "div",
    {
      className: cx("k-slot", "k-slot-filled"),
      title: `${label} (${item.id}) x${count}`
    },
    stage < 2 ? /* @__PURE__ */ react_default.createElement(
      "img",
      {
        className: "k-slot-img",
        src: stage === 0 ? urls.item : urls.block,
        alt: label,
        loading: "lazy",
        decoding: "async",
        onError: () => setStage((current) => current === 0 ? 1 : 2)
      }
    ) : /* @__PURE__ */ react_default.createElement("span", { className: "k-slot-text" }, label.slice(0, 3)),
    count > 1 ? /* @__PURE__ */ react_default.createElement("span", { className: "k-slot-count" }, count) : null
  );
};

// frontend/src/components/player/sections/Inventory.tsx
var VIEW_KEY = "kubek.players.inventoryView";
var readView = () => {
  if (typeof window === "undefined") return "native";
  return window.localStorage.getItem(VIEW_KEY) === "classic" ? "classic" : "native";
};
var slots = (items) => Array.from({ length: 27 }, (_, index) => items?.[index] ?? null);
var itemKey = (items, index) => {
  const item = items?.[index];
  return item ? `${item.id}-${index}` : `empty-${index}`;
};
var Inventory = ({ player }) => {
  const kubek = useKubek();
  const { hooks, icons = {} } = kubek;
  const { t } = hooks.useTranslation();
  const Box = icons.Box || icons.Package || (() => null);
  const [view, setView] = react_default.useState(readView);
  const [tab, setTab] = react_default.useState("main");
  const changeView = (next) => {
    const mode = next === "classic" ? "classic" : "native";
    setView(mode);
    if (typeof window !== "undefined") window.localStorage.setItem(VIEW_KEY, mode);
  };
  const inventory = player.inventory;
  const armor = inventory?.armor;
  return /* @__PURE__ */ react_default.createElement(Panel, { className: cx(view === "classic" && "k-inv--classic") }, /* @__PURE__ */ react_default.createElement(PanelHead, null, /* @__PURE__ */ react_default.createElement(Plate, { tone: "blue", size: "sm" }, /* @__PURE__ */ react_default.createElement(Box, null)), /* @__PURE__ */ react_default.createElement("span", { className: "k-section-title" }, t("ext.players.inventory") || "Inventory"), /* @__PURE__ */ react_default.createElement("div", { className: "k-section-switches" }, /* @__PURE__ */ react_default.createElement(
    TabBar,
    {
      compact: true,
      items: [
        { id: "native", label: t("ext.players.inventory_native") || "Native" },
        { id: "classic", label: t("ext.players.inventory_classic") || "Classic" }
      ],
      value: view,
      onChange: changeView,
      label: "Inventory style"
    }
  ))), /* @__PURE__ */ react_default.createElement(PanelBody, null, !inventory ? /* @__PURE__ */ react_default.createElement(Empty, null, /* @__PURE__ */ react_default.createElement(EmptyHeader, null, /* @__PURE__ */ react_default.createElement(EmptyTitle, null, "No inventory data"), /* @__PURE__ */ react_default.createElement(EmptyDescription, null, "Inventory appears once the player has a data file on disk."))) : /* @__PURE__ */ react_default.createElement("div", { className: "k-inv" }, inventory.enderChest ? /* @__PURE__ */ react_default.createElement(
    TabBar,
    {
      compact: true,
      items: [
        { id: "main", label: t("ext.players.inventory") || "Inventory" },
        { id: "ender", label: t("ext.players.ender_chest") || "Ender chest" }
      ],
      value: tab,
      onChange: (id) => setTab(id),
      label: "Inventory page"
    }
  ) : null, /* @__PURE__ */ react_default.createElement("div", { className: "k-inv-canvas" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-inv-scroll" }, tab === "main" ? /* @__PURE__ */ react_default.createElement(react_default.Fragment, null, /* @__PURE__ */ react_default.createElement("div", { className: "k-inv-layout" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-inv-armor-col" }, /* @__PURE__ */ react_default.createElement(ItemSlot, { item: armor?.helmet, placeholder: /* @__PURE__ */ react_default.createElement(SlotHelmetIcon, { className: "k-slot-icon" }) }), /* @__PURE__ */ react_default.createElement(ItemSlot, { item: armor?.chestplate, placeholder: /* @__PURE__ */ react_default.createElement(SlotChestplateIcon, { className: "k-slot-icon" }) }), /* @__PURE__ */ react_default.createElement(ItemSlot, { item: armor?.leggings, placeholder: /* @__PURE__ */ react_default.createElement(SlotLeggingsIcon, { className: "k-slot-icon" }) }), /* @__PURE__ */ react_default.createElement(ItemSlot, { item: armor?.boots, placeholder: /* @__PURE__ */ react_default.createElement(SlotBootsIcon, { className: "k-slot-icon" }) })), /* @__PURE__ */ react_default.createElement("div", { className: "k-inv-grid" }, slots(inventory.main).map((item, index) => /* @__PURE__ */ react_default.createElement(ItemSlot, { key: itemKey(inventory.main, index), item })))), /* @__PURE__ */ react_default.createElement("div", { className: "k-inv-bar" }, /* @__PURE__ */ react_default.createElement(ItemSlot, { item: inventory.offhand, placeholder: /* @__PURE__ */ react_default.createElement(SlotShieldIcon, { className: "k-slot-icon" }) }), /* @__PURE__ */ react_default.createElement("div", { className: "k-inv-grid" }, Array.from({ length: 9 }, (_, index) => /* @__PURE__ */ react_default.createElement(ItemSlot, { key: itemKey(inventory.hotbar, index), item: inventory.hotbar?.[index] ?? null }))))) : /* @__PURE__ */ react_default.createElement("div", { className: "k-inv-grid" }, slots(inventory.enderChest).map((item, index) => /* @__PURE__ */ react_default.createElement(ItemSlot, { key: itemKey(inventory.enderChest, index), item }))))))));
};

// frontend/src/components/player/sections/LastDeath.tsx
var LastDeath = ({ player }) => {
  const kubek = useKubek();
  const { hooks, icons = {} } = kubek;
  const { t } = hooks.useTranslation();
  const Skull = icons.Skull || (() => null);
  const death = player.lastDeath;
  return /* @__PURE__ */ react_default.createElement(Panel, null, /* @__PURE__ */ react_default.createElement(PanelHead, null, /* @__PURE__ */ react_default.createElement(Plate, { tone: "amber", size: "sm" }, /* @__PURE__ */ react_default.createElement(Skull, null)), /* @__PURE__ */ react_default.createElement("span", { className: "k-section-title" }, t("ext.players.last_death") || "Last death"), death ? /* @__PURE__ */ react_default.createElement(PanelMeta, null, death.world) : null), /* @__PURE__ */ react_default.createElement(PanelBody, null, !death ? /* @__PURE__ */ react_default.createElement(Empty, null, /* @__PURE__ */ react_default.createElement(EmptyHeader, null, /* @__PURE__ */ react_default.createElement(EmptyTitle, null, "No death recorded"))) : /* @__PURE__ */ react_default.createElement("div", { className: "k-coords", style: { gridTemplateColumns: "repeat(3, minmax(0,1fr))" } }, /* @__PURE__ */ react_default.createElement("div", { className: "k-coord" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-coord-axis" }, "X"), /* @__PURE__ */ react_default.createElement("div", { className: "k-coord-value" }, formatCoordinate(death.x))), /* @__PURE__ */ react_default.createElement("div", { className: "k-coord" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-coord-axis" }, "Y"), /* @__PURE__ */ react_default.createElement("div", { className: "k-coord-value" }, formatCoordinate(death.y))), /* @__PURE__ */ react_default.createElement("div", { className: "k-coord" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-coord-axis" }, "Z"), /* @__PURE__ */ react_default.createElement("div", { className: "k-coord-value" }, formatCoordinate(death.z))))));
};

// frontend/src/components/player/sections/Position.tsx
var Coord = ({ axis, value }) => /* @__PURE__ */ react_default.createElement("div", { className: "k-coord" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-coord-axis" }, axis), /* @__PURE__ */ react_default.createElement("div", { className: "k-coord-value" }, formatCoordinate(value)));
var Position = ({
  player,
  onTeleport
}) => {
  const kubek = useKubek();
  const { hooks, icons = {}, ui } = kubek;
  const { t } = hooks.useTranslation();
  const MapPin = icons.MapPin || (() => null);
  const Sparkles = icons.Sparkles || (() => null);
  const location = player.location;
  const online = player.summary.isOnline;
  return /* @__PURE__ */ react_default.createElement(Panel, null, /* @__PURE__ */ react_default.createElement(PanelHead, null, /* @__PURE__ */ react_default.createElement(Plate, { tone: "cyan", size: "sm" }, /* @__PURE__ */ react_default.createElement(MapPin, null)), /* @__PURE__ */ react_default.createElement("span", { className: "k-section-title" }, online ? t("ext.players.position") || "Current position" : t("ext.players.last_position") || "Last known position"), location ? /* @__PURE__ */ react_default.createElement(PanelMeta, null, location.world) : null), /* @__PURE__ */ react_default.createElement(PanelBody, null, !location ? /* @__PURE__ */ react_default.createElement(Empty, null, /* @__PURE__ */ react_default.createElement(EmptyHeader, null, /* @__PURE__ */ react_default.createElement(EmptyTitle, null, "No position recorded"))) : /* @__PURE__ */ react_default.createElement("div", { className: "k-section-stack" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-coords", style: { gridTemplateColumns: "repeat(3, minmax(0,1fr))" } }, /* @__PURE__ */ react_default.createElement(Coord, { axis: "X", value: location.x }), /* @__PURE__ */ react_default.createElement(Coord, { axis: "Y", value: location.y }), /* @__PURE__ */ react_default.createElement(Coord, { axis: "Z", value: location.z })), /* @__PURE__ */ react_default.createElement(ui.Button, { variant: "outline", size: "sm", disabled: !onTeleport, onClick: onTeleport }, /* @__PURE__ */ react_default.createElement(Sparkles, null), online ? t("ext.players.teleport") || "Teleport" : t("ext.players.change_position") || "Change position"))));
};

// frontend/src/ui/key-value.tsx
var KeyValue = ({
  className,
  children
}) => /* @__PURE__ */ react_default.createElement("dl", { className: cx("k-kv", className) }, children);
var KeyValueItem = ({
  label,
  children
}) => /* @__PURE__ */ react_default.createElement(react_default.Fragment, null, /* @__PURE__ */ react_default.createElement("dt", null, label), /* @__PURE__ */ react_default.createElement("dd", null, children));

// frontend/src/components/player/sections/Stats.tsx
var number = (value, suffix = "") => value === void 0 || value === null ? "\u2014" : `${value.toLocaleString()}${suffix}`;
var Stats = ({ player }) => {
  const kubek = useKubek();
  const { hooks, icons = {} } = kubek;
  const { t } = hooks.useTranslation();
  const Chart = icons.ChartColumn || icons.BarChart3 || icons.BarChart || (() => null);
  const stats = player.stats;
  return /* @__PURE__ */ react_default.createElement(Panel, null, /* @__PURE__ */ react_default.createElement(PanelHead, null, /* @__PURE__ */ react_default.createElement(Plate, { tone: "purple", size: "sm" }, /* @__PURE__ */ react_default.createElement(Chart, null)), /* @__PURE__ */ react_default.createElement("span", { className: "k-section-title" }, t("ext.players.stats") || "Gameplay statistics")), /* @__PURE__ */ react_default.createElement(PanelBody, null, !stats ? /* @__PURE__ */ react_default.createElement(Empty, null, /* @__PURE__ */ react_default.createElement(EmptyHeader, null, /* @__PURE__ */ react_default.createElement(EmptyTitle, null, "No statistics recorded"), /* @__PURE__ */ react_default.createElement(EmptyDescription, null, "Statistics appear once the player has a statistics file on disk."))) : /* @__PURE__ */ react_default.createElement(KeyValue, null, /* @__PURE__ */ react_default.createElement(KeyValueItem, { label: t("ext.players.playtime") || "Playtime" }, stats.playtimeText || "0m"), /* @__PURE__ */ react_default.createElement(KeyValueItem, { label: t("ext.players.kills") || "Player kills" }, number(stats.playerKills)), /* @__PURE__ */ react_default.createElement(KeyValueItem, { label: t("ext.players.deaths") || "Deaths" }, number(stats.deaths)), /* @__PURE__ */ react_default.createElement(KeyValueItem, { label: t("ext.players.kdr") || "KDR" }, number(stats.kdr)), /* @__PURE__ */ react_default.createElement(KeyValueItem, { label: t("ext.players.distance_total") || "Distance travelled" }, number(stats.distanceTotal, " blocks")), /* @__PURE__ */ react_default.createElement(KeyValueItem, { label: t("ext.players.distance_walked") || "Distance walked" }, number(stats.distanceWalked, " blocks")), /* @__PURE__ */ react_default.createElement(KeyValueItem, { label: t("ext.players.distance_sprinted") || "Distance sprinted" }, number(stats.distanceSprinted, " blocks")), /* @__PURE__ */ react_default.createElement(KeyValueItem, { label: t("ext.players.blocks_broken") || "Blocks broken" }, number(stats.blocksBroken)), /* @__PURE__ */ react_default.createElement(KeyValueItem, { label: t("ext.players.items_used") || "Items used" }, number(stats.itemsUsed)), /* @__PURE__ */ react_default.createElement(KeyValueItem, { label: t("ext.players.entities_killed") || "Entities killed" }, number(stats.entitiesKilled)))));
};

// frontend/src/components/player/sections/Vitals.tsx
var healthIcon = (hp) => {
  const value = typeof hp === "number" && !Number.isNaN(hp) ? hp : 20;
  return Array.from({ length: 10 }, (_, index) => {
    const slot = (index + 1) * 2;
    const type = value >= slot ? "full" : value >= slot - 1 ? "half" : "empty";
    return /* @__PURE__ */ react_default.createElement("span", { key: `heart-${index}`, className: "k-hud-icon" }, /* @__PURE__ */ react_default.createElement(MinecraftHeart, { type, className: "k-hud-svg" }));
  });
};
var foodIcon = (food) => {
  const value = typeof food === "number" && !Number.isNaN(food) ? food : 20;
  return Array.from({ length: 10 }, (_, index) => {
    const slot = (index + 1) * 2;
    const type = value >= slot ? "full" : value >= slot - 1 ? "half" : "empty";
    return /* @__PURE__ */ react_default.createElement("span", { key: `food-${index}`, className: "k-hud-icon" }, /* @__PURE__ */ react_default.createElement(MinecraftFood, { type, className: "k-hud-svg" }));
  });
};
var Vitals = ({ serverId, uuid, player, onChanged, onRefetch }) => {
  const kubek = useKubek();
  const { ui, http, query, hooks, icons = {} } = kubek;
  const { t } = hooks.useTranslation();
  const { notify } = useToast();
  const vitalsMutation = query.useMutation({
    mutationFn: (action) => http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/vitals`, { action }),
    onSuccess: () => {
      onRefetch();
      onChanged();
    },
    onError: (error) => {
      void getMutationErrorMessage(error).then(
        (message) => notify({ type: "error", title: message })
      );
    }
  });
  const HeartPulse = icons.HeartPulse || icons.Heart || icons.Activity || (() => null);
  const Utensils = icons.Utensils || icons.Apple || icons.Flame || (() => null);
  const Skull = icons.Skull || (() => null);
  const vitals = player.vitals;
  const online = player.summary.isOnline;
  const pending = vitalsMutation.isPending;
  const disabled = pending || !online;
  return /* @__PURE__ */ react_default.createElement(Panel, null, /* @__PURE__ */ react_default.createElement(PanelHead, null, /* @__PURE__ */ react_default.createElement(Plate, { tone: "green", size: "sm" }, /* @__PURE__ */ react_default.createElement(HeartPulse, null)), /* @__PURE__ */ react_default.createElement("span", { className: "k-section-title" }, t("ext.players.vitals") || "Vitals"), /* @__PURE__ */ react_default.createElement(PanelMeta, null, "Level ", vitals?.level ?? 0)), /* @__PURE__ */ react_default.createElement(PanelBody, null, !vitals ? /* @__PURE__ */ react_default.createElement(Empty, null, /* @__PURE__ */ react_default.createElement(EmptyHeader, null, /* @__PURE__ */ react_default.createElement(EmptyTitle, null, "No vitals recorded"), /* @__PURE__ */ react_default.createElement(EmptyDescription, null, "Health and experience appear once the player has joined the server."))) : /* @__PURE__ */ react_default.createElement("div", { className: "k-vitals" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-xp" }, /* @__PURE__ */ react_default.createElement(
    "div",
    {
      className: "k-xp-fill",
      style: { width: `${Math.round((vitals.xpProgress ?? 0) * 100)}%` }
    }
  )), /* @__PURE__ */ react_default.createElement("div", { className: "k-hud" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-hud-icons" }, healthIcon(vitals.health)), /* @__PURE__ */ react_default.createElement("span", { className: "k-hud-value" }, vitals.health ?? 20, " / 20")), /* @__PURE__ */ react_default.createElement("div", { className: "k-hud" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-hud-icons" }, foodIcon(vitals.food)), /* @__PURE__ */ react_default.createElement("span", { className: "k-hud-value" }, vitals.food ?? 20, " / 20")), /* @__PURE__ */ react_default.createElement("div", { className: "k-vitals-actions" }, /* @__PURE__ */ react_default.createElement(ui.Button, { variant: "outline", size: "xs", disabled, onClick: () => vitalsMutation.mutate("heal") }, /* @__PURE__ */ react_default.createElement(HeartPulse, null), t("ext.players.heal") || "Heal"), /* @__PURE__ */ react_default.createElement(ui.Button, { variant: "outline", size: "xs", disabled, onClick: () => vitalsMutation.mutate("feed") }, /* @__PURE__ */ react_default.createElement(Utensils, null), t("ext.players.feed") || "Feed"), /* @__PURE__ */ react_default.createElement(ui.Button, { variant: "destructive", size: "xs", disabled, onClick: () => vitalsMutation.mutate("kill") }, /* @__PURE__ */ react_default.createElement(Skull, null), t("ext.players.kill") || "Kill"), /* @__PURE__ */ react_default.createElement(ui.Button, { variant: "destructive", size: "xs", disabled, onClick: () => vitalsMutation.mutate("starve") }, /* @__PURE__ */ react_default.createElement(Skull, null), t("ext.players.starve") || "Starve")))));
};

// frontend/src/components/player/PlayerDetailsDialog.tsx
var PlayerDetailsDialog = ({ serverId, uuid, onClose, onChanged }) => {
  const kubek = useKubek();
  const { http, query, hooks, icons = {}, ui } = kubek;
  const { t } = hooks.useTranslation();
  const { notify } = useToast();
  const [teleportOpen, setTeleportOpen] = react_default.useState(false);
  const detailsQuery = query.useQuery({
    queryKey: ["ext", "players", serverId, "player", uuid],
    queryFn: () => http.get(`ext/com.kubek.players/servers/${serverId}/players/${uuid}`),
    refetchInterval: 6e3
  });
  const details = detailsQuery.data;
  const summary = details?.summary;
  const name = summary?.username || uuid;
  const online = Boolean(summary?.isOnline);
  const Badge = ui?.Badge;
  const Refresh = icons.RefreshCw || (() => null);
  const X = icons.X || (() => null);
  const Copy = icons.Copy || (() => null);
  const copyUuid = () => {
    void navigator.clipboard?.writeText(uuid);
    notify({ type: "success", title: t("ext.players.copied") || "Copied to clipboard" });
  };
  const player = details ?? {
    summary: { uuid, username: name, isOnline: false }
  };
  return /* @__PURE__ */ react_default.createElement(Dialog, { open: true, onClose, label: t("ext.players.details") || "Player details", width: 1040 }, /* @__PURE__ */ react_default.createElement(
    DialogHeader,
    {
      leading: /* @__PURE__ */ react_default.createElement(PlayerHead, { name, size: 40 }),
      title: name,
      description: /* @__PURE__ */ react_default.createElement("span", { className: "k-dialog-sub" }, /* @__PURE__ */ react_default.createElement("button", { type: "button", className: "k-dialog-uuid", onClick: copyUuid, title: "Copy UUID" }, /* @__PURE__ */ react_default.createElement("span", null, uuid), /* @__PURE__ */ react_default.createElement(Copy, null)), Badge ? /* @__PURE__ */ react_default.createElement(react_default.Fragment, null, /* @__PURE__ */ react_default.createElement(Badge, { variant: online ? "success" : "secondary" }, online ? t("ext.players.online") || "Online" : t("ext.players.offline") || "Offline"), details?.permissions?.isOp ? /* @__PURE__ */ react_default.createElement(Badge, { variant: "warning" }, "OP") : null, details?.permissions?.isWhitelisted ? /* @__PURE__ */ react_default.createElement(Badge, { variant: "secondary" }, t("ext.players.whitelisted") || "Whitelisted") : null, details?.permissions?.isBanned ? /* @__PURE__ */ react_default.createElement(Badge, { variant: "destructive" }, t("ext.players.banned") || "Banned") : null) : null),
      actions: /* @__PURE__ */ react_default.createElement(react_default.Fragment, null, /* @__PURE__ */ react_default.createElement(
        ui.Button,
        {
          variant: "ghost",
          size: "icon-sm",
          onClick: () => detailsQuery.refetch(),
          disabled: detailsQuery.isFetching,
          title: t("ext.players.refresh") || "Refresh",
          "aria-label": t("ext.players.refresh") || "Refresh"
        },
        /* @__PURE__ */ react_default.createElement(Refresh, { className: detailsQuery.isFetching ? "k-spin" : void 0 })
      ), /* @__PURE__ */ react_default.createElement(
        ui.Button,
        {
          variant: "ghost",
          size: "icon-sm",
          onClick: onClose,
          title: t("ext.players.close") || "Close",
          "aria-label": t("ext.players.close") || "Close"
        },
        /* @__PURE__ */ react_default.createElement(X, null)
      ))
    }
  ), /* @__PURE__ */ react_default.createElement(DialogBody, null, detailsQuery.isLoading && !details ? /* @__PURE__ */ react_default.createElement("div", { className: "k-dialog-loading", "aria-busy": "true" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-skeleton-row" }), /* @__PURE__ */ react_default.createElement("div", { className: "k-skeleton-row" }), /* @__PURE__ */ react_default.createElement("div", { className: "k-skeleton-row" })) : /* @__PURE__ */ react_default.createElement("div", { className: "k-player-grid" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-player-main" }, /* @__PURE__ */ react_default.createElement(
    Vitals,
    {
      serverId,
      uuid,
      player,
      onChanged,
      onRefetch: () => detailsQuery.refetch()
    }
  ), /* @__PURE__ */ react_default.createElement(
    Inventory,
    {
      serverId,
      uuid,
      player,
      onChanged,
      onRefetch: () => detailsQuery.refetch()
    }
  ), /* @__PURE__ */ react_default.createElement(
    DangerZone,
    {
      serverId,
      uuid,
      player,
      onChanged,
      onRefetch: () => detailsQuery.refetch()
    }
  )), /* @__PURE__ */ react_default.createElement("div", { className: "k-player-side" }, /* @__PURE__ */ react_default.createElement(
    Position,
    {
      serverId,
      uuid,
      player,
      onChanged,
      onRefetch: () => detailsQuery.refetch(),
      onTeleport: () => setTeleportOpen(true)
    }
  ), /* @__PURE__ */ react_default.createElement(
    LastDeath,
    {
      serverId,
      uuid,
      player,
      onChanged,
      onRefetch: () => detailsQuery.refetch()
    }
  ), /* @__PURE__ */ react_default.createElement(
    Stats,
    {
      serverId,
      uuid,
      player,
      onChanged,
      onRefetch: () => detailsQuery.refetch()
    }
  ), /* @__PURE__ */ react_default.createElement(
    Access,
    {
      serverId,
      uuid,
      player,
      onChanged,
      onRefetch: () => detailsQuery.refetch()
    }
  )))), /* @__PURE__ */ react_default.createElement(DialogFooter, null, /* @__PURE__ */ react_default.createElement("span", { className: "k-dialog-stamp" }, details?.lastRefreshedText ? `Refreshed ${details.lastRefreshedText}` : "Live data"), /* @__PURE__ */ react_default.createElement(ui.Button, { variant: "outline", onClick: onClose }, t("ext.players.close") || "Close")), teleportOpen ? /* @__PURE__ */ react_default.createElement(
    TeleportModal,
    {
      serverId,
      uuid,
      username: name,
      isOnline: online,
      currentLocation: details?.location,
      onClose: () => setTeleportOpen(false),
      onSuccess: () => {
        void detailsQuery.refetch();
        onChanged();
      }
    }
  ) : null);
};

// frontend/src/components/tabs/ListTab.tsx
var ListTab = ({ meta, head, total, shown, query, onQuery, addForm, loading, empty, noMatches, children }) => /* @__PURE__ */ react_default.createElement(Panel, null, /* @__PURE__ */ react_default.createElement(PanelHead, null, head, /* @__PURE__ */ react_default.createElement(PanelMeta, null, meta), total > 0 ? /* @__PURE__ */ react_default.createElement("div", { className: "k-panel-search" }, /* @__PURE__ */ react_default.createElement(
  SearchInput,
  {
    value: query,
    onChange: onQuery,
    placeholder: "Search",
    label: "Search"
  }
)) : null), addForm, loading ? /* @__PURE__ */ react_default.createElement("div", { className: "k-skeleton", "aria-busy": "true" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-skeleton-row" }), /* @__PURE__ */ react_default.createElement("div", { className: "k-skeleton-row" })) : total === 0 ? /* @__PURE__ */ react_default.createElement(Empty, null, /* @__PURE__ */ react_default.createElement(EmptyHeader, null, /* @__PURE__ */ react_default.createElement(EmptyMedia, { icon: empty.icon }), /* @__PURE__ */ react_default.createElement(EmptyTitle, null, empty.title), empty.description ? /* @__PURE__ */ react_default.createElement(EmptyDescription, null, empty.description) : null)) : shown === 0 ? /* @__PURE__ */ react_default.createElement(Empty, null, /* @__PURE__ */ react_default.createElement(EmptyHeader, null, /* @__PURE__ */ react_default.createElement(EmptyTitle, null, noMatches.title), noMatches.hint ? /* @__PURE__ */ react_default.createElement(EmptyDescription, null, noMatches.hint) : null)) : children);
var ListAddForm = ({ value, onChange, onSubmit, placeholder, submitLabel, pending, reason, onReason, reasonPlaceholder }) => {
  const kubek = useKubek();
  const Input = kubek?.ui?.Input ?? "input";
  const Button = kubek?.ui?.Button ?? "button";
  const Plus = kubek?.icons?.Plus || (() => null);
  return /* @__PURE__ */ react_default.createElement(
    "form",
    {
      className: "k-add-row",
      onSubmit: (event) => {
        event.preventDefault();
        onSubmit();
      }
    },
    /* @__PURE__ */ react_default.createElement(
      Input,
      {
        className: "k-input",
        value,
        placeholder,
        onChange: (event) => onChange(event.target.value)
      }
    ),
    onReason ? /* @__PURE__ */ react_default.createElement(
      Input,
      {
        className: "k-input k-add-reason",
        value: reason ?? "",
        placeholder: reasonPlaceholder ?? "Reason (optional)",
        onChange: (event) => onReason(event.target.value)
      }
    ) : null,
    /* @__PURE__ */ react_default.createElement(Button, { type: "submit", disabled: !value.trim() || pending }, /* @__PURE__ */ react_default.createElement(Plus, null), submitLabel)
  );
};

// frontend/src/components/tabs/list-helpers.ts
function listEntryIdentifier(entry) {
  return entry.name || entry.ip || entry.uuid || "";
}
function buildListPayload(value, reason) {
  const trimmed = value.trim();
  return {
    name: trimmed,
    ip: trimmed,
    reason: reason?.trim() || void 0
  };
}

// frontend/src/components/tabs/usePlayerList.ts
function usePlayerList(serverId, type, onChanged) {
  const kubek = useKubek();
  const { http, query, hooks } = kubek;
  const { t } = hooks.useTranslation();
  const { notify } = useToast();
  const [input, setInput] = react_default.useState("");
  const [reason, setReason] = react_default.useState("");
  const listQuery = query.useQuery({
    queryKey: ["ext", "players", serverId, "list", type],
    queryFn: () => http.get(`ext/com.kubek.players/servers/${serverId}/lists/${type}`)
  });
  const showError = react_default.useCallback(
    (error) => {
      void getMutationErrorMessage(error).then(
        (message) => notify({ type: "error", title: message })
      );
    },
    [notify]
  );
  const addMutation = query.useMutation({
    mutationFn: (body) => http.post(`ext/com.kubek.players/servers/${serverId}/lists/${type}`, body),
    onSuccess: () => {
      setInput("");
      setReason("");
      void listQuery.refetch();
      onChanged();
    },
    onError: showError
  });
  const deleteMutation = query.useMutation({
    mutationFn: (identifier) => http.delete(
      `ext/com.kubek.players/servers/${serverId}/lists/${type}/${encodeURIComponent(identifier)}`
    ),
    onSuccess: () => {
      void listQuery.refetch();
      onChanged();
    },
    onError: showError
  });
  const add = () => {
    if (!input.trim()) return;
    addMutation.mutate(buildListPayload(input, reason));
  };
  const entries = listQuery.data?.entries || [];
  return {
    t,
    entries,
    isLoading: listQuery.isLoading,
    input,
    setInput,
    reason,
    setReason,
    add,
    addPending: addMutation.isPending,
    remove: (identifier) => deleteMutation.mutate(identifier),
    removePending: deleteMutation.isPending
  };
}

// frontend/src/components/tabs/BansTab.tsx
var BansTab = ({
  serverId,
  onChanged
}) => {
  const kubek = useKubek();
  const [kind, setKind] = react_default.useState("players");
  const [query, setQuery] = react_default.useState("");
  const type = kind === "players" ? "banned-players" : "banned-ips";
  const list = usePlayerList(serverId, type, onChanged);
  const Trash = kubek?.icons?.Trash2 || (() => null);
  const Globe = kubek?.icons?.Globe || (() => null);
  const Ban = kubek?.icons?.Ban || (() => null);
  const Badge = kubek?.ui?.Badge;
  const rows = list.entries.filter(
    (entry) => matchesQuery(query, entry.name, entry.ip, entry.uuid, entry.reason)
  );
  return /* @__PURE__ */ react_default.createElement(
    ListTab,
    {
      head: /* @__PURE__ */ react_default.createElement(
        TabBar,
        {
          compact: true,
          items: [
            { id: "players", label: "Players" },
            { id: "ips", label: "IPs" }
          ],
          value: kind,
          onChange: (id) => {
            setKind(id);
            setQuery("");
          },
          label: "Ban type"
        }
      ),
      meta: `${list.entries.length} entries`,
      total: list.entries.length,
      shown: rows.length,
      query,
      onQuery: setQuery,
      loading: list.isLoading,
      empty: {
        icon: /* @__PURE__ */ react_default.createElement(Ban, null),
        title: kind === "players" ? "No banned players" : "No banned addresses",
        description: "Bans made here are written to the server's ban lists."
      },
      noMatches: {
        title: list.t("ext.players.no_matches") || "No matches",
        hint: list.t("ext.players.no_matches_hint") || "Try a different name or UUID."
      },
      addForm: /* @__PURE__ */ react_default.createElement(
        ListAddForm,
        {
          value: list.input,
          onChange: list.setInput,
          onSubmit: list.add,
          pending: list.addPending,
          placeholder: kind === "players" ? list.t("ext.players.placeholder_player") || "Username" : list.t("ext.players.placeholder_ip") || "IP address",
          submitLabel: list.t("ext.players.add_entry") || "Ban",
          reason: list.reason,
          onReason: list.setReason,
          reasonPlaceholder: "Reason (optional)"
        }
      )
    },
    /* @__PURE__ */ react_default.createElement("div", { className: "k-rows" }, rows.map((entry) => {
      const name = listEntryIdentifier(entry);
      return /* @__PURE__ */ react_default.createElement(
        PlayerRow,
        {
          key: name,
          name,
          uuid: kind === "players" ? entry.uuid : void 0,
          head: kind === "ips" ? /* @__PURE__ */ react_default.createElement(Plate, { tone: "red", size: "lg" }, /* @__PURE__ */ react_default.createElement(Globe, null)) : void 0,
          badges: Badge ? /* @__PURE__ */ react_default.createElement(Badge, { variant: "destructive" }, "Banned") : /* @__PURE__ */ react_default.createElement("span", { className: "k-badge" }, "Banned"),
          detail: entry.reason || void 0,
          actions: /* @__PURE__ */ react_default.createElement(
            "button",
            {
              type: "button",
              className: "k-icon-btn k-icon-danger",
              title: "Pardon",
              "aria-label": "Pardon",
              disabled: list.removePending,
              onClick: () => list.remove(name)
            },
            /* @__PURE__ */ react_default.createElement(Trash, null)
          )
        }
      );
    }))
  );
};

// frontend/src/components/tabs/OnlineTab.tsx
var OnlineTab = ({ players, isLoading, emptyIcon, onSelectPlayer }) => {
  const kubek = useKubek();
  const { t } = kubek?.hooks?.useTranslation?.() ?? { t: (key) => key };
  const [query, setQuery] = react_default.useState("");
  const rows = players.filter((player) => matchesQuery(query, player.username, player.uuid));
  const Badge = kubek?.ui?.Badge;
  const ArrowRight = kubek?.icons?.ArrowRight || (() => null);
  const UsersIcon = kubek?.icons?.Users || (() => null);
  return /* @__PURE__ */ react_default.createElement(Panel, null, /* @__PURE__ */ react_default.createElement(PanelHead, null, /* @__PURE__ */ react_default.createElement(PanelMeta, null, players.length, " online"), players.length > 0 ? /* @__PURE__ */ react_default.createElement("div", { className: "k-panel-search" }, /* @__PURE__ */ react_default.createElement(
    SearchInput,
    {
      value: query,
      onChange: setQuery,
      placeholder: t("ext.players.search") || "Search players",
      label: t("ext.players.search") || "Search players"
    }
  )) : null), isLoading ? /* @__PURE__ */ react_default.createElement("div", { className: "k-skeleton", "aria-busy": "true" }, /* @__PURE__ */ react_default.createElement("div", { className: "k-skeleton-row" }), /* @__PURE__ */ react_default.createElement("div", { className: "k-skeleton-row" }), /* @__PURE__ */ react_default.createElement("div", { className: "k-skeleton-row" })) : rows.length === 0 ? /* @__PURE__ */ react_default.createElement(Empty, null, /* @__PURE__ */ react_default.createElement(EmptyHeader, null, /* @__PURE__ */ react_default.createElement(EmptyMedia, { icon: emptyIcon ?? /* @__PURE__ */ react_default.createElement(UsersIcon, null) }), /* @__PURE__ */ react_default.createElement(EmptyTitle, null, players.length === 0 ? t("ext.players.no_players_online") : t("ext.players.no_matches")), /* @__PURE__ */ react_default.createElement(EmptyDescription, null, players.length === 0 ? t("ext.players.no_players_online_hint") : t("ext.players.no_matches_hint")))) : /* @__PURE__ */ react_default.createElement("div", { className: "k-rows" }, rows.map((player) => {
    const key = player.uuid || player.username;
    return /* @__PURE__ */ react_default.createElement(
      PlayerRow,
      {
        key,
        name: player.username,
        uuid: player.uuid,
        badges: Badge ? /* @__PURE__ */ react_default.createElement(Badge, { variant: "success" }, t("ext.players.online")) : /* @__PURE__ */ react_default.createElement("span", { className: "k-badge" }, t("ext.players.online")),
        onOpen: onSelectPlayer ? () => onSelectPlayer(key) : void 0,
        actions: onSelectPlayer ? /* @__PURE__ */ react_default.createElement(
          "button",
          {
            type: "button",
            className: "k-icon-btn",
            title: t("ext.players.details"),
            "aria-label": t("ext.players.details"),
            onClick: () => onSelectPlayer(key)
          },
          /* @__PURE__ */ react_default.createElement(ArrowRight, null)
        ) : void 0
      }
    );
  })));
};

// frontend/src/components/tabs/NameListTab.tsx
var NameListTab = ({ serverId, type, onChanged }) => {
  const kubek = useKubek();
  const list = usePlayerList(serverId, type, onChanged);
  const [query, setQuery] = react_default.useState("");
  const Trash = kubek?.icons?.Trash2 || (() => null);
  const UserCheck = kubek?.icons?.UserCheck || (() => null);
  const Crown = kubek?.icons?.Crown || (() => null);
  const icon = type === "ops" ? /* @__PURE__ */ react_default.createElement(Crown, null) : /* @__PURE__ */ react_default.createElement(UserCheck, null);
  const rows = list.entries.filter(
    (entry) => matchesQuery(query, entry.name, entry.uuid)
  );
  const identifier = (entry) => listEntryIdentifier(entry);
  return /* @__PURE__ */ react_default.createElement(
    ListTab,
    {
      meta: `${list.entries.length} entries`,
      total: list.entries.length,
      shown: rows.length,
      query,
      onQuery: setQuery,
      loading: list.isLoading,
      empty: {
        icon,
        title: type === "ops" ? "No operators yet" : "The whitelist is empty",
        description: type === "ops" ? "Grant operator to a player by username." : "Add a player by username to allow them in."
      },
      noMatches: {
        title: list.t("ext.players.no_matches") || "No matches",
        hint: list.t("ext.players.no_matches_hint") || "Try a different name or UUID."
      },
      addForm: /* @__PURE__ */ react_default.createElement(
        ListAddForm,
        {
          value: list.input,
          onChange: list.setInput,
          onSubmit: list.add,
          pending: list.addPending,
          placeholder: list.t("ext.players.placeholder_player") || "Username",
          submitLabel: list.t("ext.players.add_entry") || "Add"
        }
      )
    },
    /* @__PURE__ */ react_default.createElement("div", { className: "k-rows" }, rows.map((entry) => {
      const name = identifier(entry);
      return /* @__PURE__ */ react_default.createElement(
        PlayerRow,
        {
          key: entry.uuid || name,
          name,
          uuid: entry.uuid,
          actions: /* @__PURE__ */ react_default.createElement(
            "button",
            {
              type: "button",
              className: "k-icon-btn k-icon-danger",
              title: "Remove",
              "aria-label": "Remove",
              disabled: list.removePending,
              onClick: () => list.remove(name)
            },
            /* @__PURE__ */ react_default.createElement(Trash, null)
          )
        }
      );
    }))
  );
};

// frontend/src/components/tabs/OpsTab.tsx
var OpsTab = ({
  serverId,
  onChanged
}) => /* @__PURE__ */ react_default.createElement(NameListTab, { serverId, type: "ops", onChanged });

// frontend/src/components/tabs/WhitelistTab.tsx
var WhitelistTab = ({
  serverId,
  onChanged
}) => /* @__PURE__ */ react_default.createElement(NameListTab, { serverId, type: "whitelist", onChanged });

// frontend/src/components/PlayersDashboard.tsx
var PlayersPageInner = ({ kubek }) => {
  const { ui, icons = {}, http, query, hooks } = kubek;
  const { t } = hooks.useTranslation();
  const [selectedServerId, setSelectedServerId] = react_default.useState("");
  const [activeTab, setActiveTab] = react_default.useState("online");
  const [selectedPlayerUuid, setSelectedPlayerUuid] = react_default.useState(null);
  const serversQuery = query.useQuery({
    queryKey: ["servers", "list"],
    queryFn: () => http.get("servers")
  });
  const rawServers = serversQuery.data;
  const servers = Array.isArray(rawServers) ? rawServers : rawServers?.servers || [];
  react_default.useEffect(() => {
    if (!selectedServerId && servers.length > 0) {
      const saved = typeof window !== "undefined" ? localStorage.getItem("selected_server_id") : null;
      const found = servers.find((server) => server.id === saved);
      setSelectedServerId(found ? found.id : servers[0].id);
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
  const refreshLists = react_default.useCallback(() => {
    void summaryQuery.refetch();
    void directoryQuery.refetch();
  }, [summaryQuery, directoryQuery]);
  const refreshAll = react_default.useCallback(() => {
    void serversQuery.refetch();
    void summaryQuery.refetch();
    void onlineQuery.refetch();
    void directoryQuery.refetch();
  }, [serversQuery, summaryQuery, onlineQuery, directoryQuery]);
  const icon = (name) => icons[name] || (() => null);
  const RefreshIcon = icon("RefreshCw");
  const ServerIcon = icon("Server");
  const UsersIcon = icon("Users");
  const RadioIcon = icon("Radio");
  const ListChecksIcon = icon("ListChecks");
  const CrownIcon = icon("Crown");
  const BanIcon = icon("Ban");
  const tabs = [
    { id: "online", label: t("ext.players.tab_online"), icon: /* @__PURE__ */ react_default.createElement(RadioIcon, null), count: onlinePlayers.length },
    { id: "all", label: t("ext.players.tab_all"), icon: /* @__PURE__ */ react_default.createElement(UsersIcon, null), count: allPlayers.length },
    { id: "whitelist", label: t("ext.players.whitelist"), icon: /* @__PURE__ */ react_default.createElement(ListChecksIcon, null), count: summary.whitelistCount },
    { id: "ops", label: t("ext.players.ops"), icon: /* @__PURE__ */ react_default.createElement(CrownIcon, null), count: summary.opsCount },
    { id: "bans", label: t("ext.players.tab_bans"), icon: /* @__PURE__ */ react_default.createElement(BanIcon, null), count: summary.bannedPlayersCount }
  ];
  const selectServer = (id) => {
    setSelectedServerId(id);
    if (typeof window !== "undefined") localStorage.setItem("selected_server_id", id);
  };
  return /* @__PURE__ */ react_default.createElement("div", { className: "k-page" }, /* @__PURE__ */ react_default.createElement(
    PageHeader,
    {
      title: t("ext.players.title") || "Players",
      description: t("ext.players.subtitle"),
      actions: /* @__PURE__ */ react_default.createElement(react_default.Fragment, null, servers.length > 1 ? /* @__PURE__ */ react_default.createElement("label", { className: "k-select-wrap" }, /* @__PURE__ */ react_default.createElement(ServerIcon, { className: "k-select-icon" }), /* @__PURE__ */ react_default.createElement(
        "select",
        {
          className: "k-select",
          value: selectedServerId,
          onChange: (event) => selectServer(event.target.value),
          "aria-label": t("ext.players.select_server")
        },
        servers.map((server) => /* @__PURE__ */ react_default.createElement("option", { key: server.id, value: server.id }, server.name, " (", server.status, ")"))
      )) : null, /* @__PURE__ */ react_default.createElement(
        ui.Button,
        {
          variant: "outline",
          size: "icon",
          onClick: refreshAll,
          title: t("ext.players.refresh"),
          "aria-label": t("ext.players.refresh")
        },
        /* @__PURE__ */ react_default.createElement(RefreshIcon, { className: onlineQuery.isFetching ? "k-spin" : void 0 })
      ))
    }
  ), !selectedServerId ? /* @__PURE__ */ react_default.createElement(Panel, null, /* @__PURE__ */ react_default.createElement(Empty, null, /* @__PURE__ */ react_default.createElement(EmptyHeader, null, /* @__PURE__ */ react_default.createElement(EmptyMedia, { icon: /* @__PURE__ */ react_default.createElement(ServerIcon, null) }), /* @__PURE__ */ react_default.createElement(EmptyTitle, null, t("ext.players.no_server")), /* @__PURE__ */ react_default.createElement(EmptyDescription, null, t("ext.players.no_server_hint"))))) : /* @__PURE__ */ react_default.createElement(react_default.Fragment, null, /* @__PURE__ */ react_default.createElement(StatStrip, null, /* @__PURE__ */ react_default.createElement(
    Stat,
    {
      label: t("ext.players.online"),
      value: onlinePlayers.length,
      icon: /* @__PURE__ */ react_default.createElement(RadioIcon, null),
      tone: "green",
      onClick: () => setActiveTab("online")
    }
  ), /* @__PURE__ */ react_default.createElement(
    Stat,
    {
      label: t("ext.players.whitelist"),
      value: summary.whitelistCount,
      icon: /* @__PURE__ */ react_default.createElement(ListChecksIcon, null),
      tone: "blue",
      onClick: () => setActiveTab("whitelist")
    }
  ), /* @__PURE__ */ react_default.createElement(
    Stat,
    {
      label: t("ext.players.ops"),
      value: summary.opsCount,
      icon: /* @__PURE__ */ react_default.createElement(CrownIcon, null),
      tone: "amber",
      onClick: () => setActiveTab("ops")
    }
  ), /* @__PURE__ */ react_default.createElement(
    Stat,
    {
      label: t("ext.players.banned_players"),
      value: summary.bannedPlayersCount,
      icon: /* @__PURE__ */ react_default.createElement(BanIcon, null),
      tone: "red",
      unit: summary.bannedIpsCount ? `\xB7 ${summary.bannedIpsCount} IP` : void 0,
      onClick: () => setActiveTab("bans")
    }
  )), /* @__PURE__ */ react_default.createElement(
    TabBar,
    {
      items: tabs,
      value: activeTab,
      onChange: (id) => setActiveTab(id),
      label: t("ext.players.tab_lists")
    }
  ), activeTab === "online" ? /* @__PURE__ */ react_default.createElement(
    OnlineTab,
    {
      players: onlinePlayers,
      isLoading: onlineQuery.isLoading,
      emptyIcon: /* @__PURE__ */ react_default.createElement(UsersIcon, null),
      onSelectPlayer: setSelectedPlayerUuid
    }
  ) : activeTab === "all" ? /* @__PURE__ */ react_default.createElement(
    AllPlayersTab,
    {
      players: allPlayers,
      isLoading: directoryQuery.isLoading,
      emptyIcon: /* @__PURE__ */ react_default.createElement(UsersIcon, null),
      onSelectPlayer: setSelectedPlayerUuid
    }
  ) : activeTab === "whitelist" ? /* @__PURE__ */ react_default.createElement(WhitelistTab, { serverId: selectedServerId, onChanged: refreshLists }) : activeTab === "ops" ? /* @__PURE__ */ react_default.createElement(OpsTab, { serverId: selectedServerId, onChanged: refreshLists }) : /* @__PURE__ */ react_default.createElement(BansTab, { serverId: selectedServerId, onChanged: refreshLists })), selectedPlayerUuid && selectedServerId ? /* @__PURE__ */ react_default.createElement(
    PlayerDetailsDialog,
    {
      serverId: selectedServerId,
      uuid: selectedPlayerUuid,
      onClose: () => setSelectedPlayerUuid(null),
      onChanged: () => {
        refreshLists();
        void onlineQuery.refetch();
      }
    }
  ) : null);
};
var PlayersPage = () => {
  const kubek = useKubek();
  if (!kubek?.query?.useQuery) {
    return /* @__PURE__ */ react_default.createElement("div", { className: "p-8 text-center text-muted-foreground animate-pulse text-sm" }, "Loading Players module...");
  }
  return /* @__PURE__ */ react_default.createElement(PlayersPageInner, { kubek });
};
var PlayersDashboard = () => /* @__PURE__ */ react_default.createElement(ToastProvider, null, /* @__PURE__ */ react_default.createElement(PlayersPage, null));

// frontend/src/styles/players.css
if (typeof document !== "undefined") {
  const styleId = "kubek-ext-players-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.setAttribute("data-extension", "com.kubek.players");
    style.textContent = `/* =====================================================================
   Native Kubek surface layer.
   Every rule below reads the panel's design tokens from :root / .dark.
   Only the classic inventory skin uses literal colors, on purpose.
   ===================================================================== */

.k-page {
  display: grid;
  gap: 24px;
  min-width: 0;
}

/* Panel ------------------------------------------------------------- */

.k-panel {
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  color: var(--card-foreground);
  box-shadow: var(--elevation-card, 0 1px 2px rgb(0 0 0 / 0.06));
}

.k-panel-head {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border);
}

.k-panel-meta {
  font-size: 12px;
  color: var(--muted-foreground);
  font-variant-numeric: tabular-nums;
}

.k-panel-body {
  padding: 16px;
}

.k-panel-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--muted-foreground);
}

/* Tones ------------------------------------------------------------- */

.k-tone-green { --k-tone: var(--c-green); }
.k-tone-blue { --k-tone: var(--c-blue); }
.k-tone-purple { --k-tone: var(--c-purple); }
.k-tone-amber { --k-tone: var(--c-amber); }
.k-tone-pink { --k-tone: var(--c-pink); }
.k-tone-cyan { --k-tone: var(--c-cyan); }
.k-tone-red { --k-tone: var(--c-red); }
.k-tone-orange { --k-tone: var(--c-orange); }
.k-tone-gray { --k-tone: var(--c-gray); }
.k-tone-primary { --k-tone: var(--primary); }

/* Plate ------------------------------------------------------------- */

.k-plate {
  display: inline-grid;
  flex-shrink: 0;
  place-items: center;
  background: color-mix(in oklch, var(--k-tone) 14%, transparent);
  color: var(--k-tone);
}

.k-plate svg {
  width: 16px;
  height: 16px;
}

.k-plate-sm { width: 26px; height: 26px; border-radius: 7px; }
.k-plate-sm svg { width: 14px; height: 14px; }
.k-plate-md { width: 30px; height: 30px; border-radius: 8px; }
.k-plate-lg { width: 36px; height: 36px; border-radius: 10px; }
.k-plate-lg svg { width: 18px; height: 18px; }
.k-plate-xl { width: 44px; height: 44px; border-radius: 10px; }
.k-plate-xl svg { width: 20px; height: 20px; }

/* Stat strip -------------------------------------------------------- */

.k-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--border);
  box-shadow: var(--elevation-card, 0 1px 2px rgb(0 0 0 / 0.06));
}

@media (min-width: 1024px) {
  .k-strip { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

.k-stat {
  display: block;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 16px;
  border: 0;
  background: var(--card);
  color: var(--card-foreground);
  font: inherit;
  text-align: left;
}

.k-stat-clickable {
  cursor: pointer;
  transition: background-color 150ms ease;
}

.k-stat-clickable:hover { background: var(--hover); }

.k-stat-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12.5px;
  color: var(--muted-foreground);
}

.k-stat-value {
  display: block;
  margin-top: 4px;
  font-size: 26px;
  line-height: 1.15;
  font-weight: 600;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.k-stat-unit {
  margin-left: 4px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: normal;
  color: var(--muted-foreground);
}

/* Page header ------------------------------------------------------- */

.k-page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.k-page-header-text { min-width: 0; }

.k-page-header h1 {
  margin: 0;
  font-size: 22px;
  line-height: 1.25;
  font-weight: 600;
  letter-spacing: -0.015em;
  color: var(--foreground);
}

.k-page-header p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--muted-foreground);
}

.k-page-header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* Empty ------------------------------------------------------------- */

.k-empty {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 16px;
  text-align: center;
}

.k-empty-header {
  display: flex;
  max-width: 384px;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.k-empty-media {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: var(--secondary);
  color: var(--muted-foreground);
}

.k-empty-media svg { width: 20px; height: 20px; }

.k-empty-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--foreground);
}

.k-empty-description {
  font-size: 13px;
  line-height: 1.45;
  color: var(--muted-foreground);
}

.k-empty-content {
  display: flex;
  max-width: 384px;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* Key / value ------------------------------------------------------- */

.k-kv {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 8px 16px;
  margin: 0;
  font-size: 13px;
}

.k-kv dt { color: var(--muted-foreground); }

.k-kv dd {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  text-align: right;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--foreground);
}

/* Tabs -------------------------------------------------------------- */

.k-tabs {
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  align-items: center;
  gap: 2px;
  padding: 4px;
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--segment);
  scrollbar-width: none;
}

.k-tabs::-webkit-scrollbar { display: none; }

.k-tab {
  display: inline-flex;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0;
  padding: 0 14px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--muted-foreground);
  font: inherit;
  font-size: 13.5px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: color 150ms ease, background-color 150ms ease, box-shadow 150ms ease;
}

.k-tab:hover { color: var(--foreground); }

.k-tab-active {
  background: var(--segment-active);
  color: var(--foreground);
  box-shadow: var(--elevation-segment, 0 1px 2px rgb(0 0 0 / 0.08));
}

.k-tab-icon { display: inline-flex; }
.k-tab-icon svg { width: 16px; height: 16px; }
.k-tab-active .k-tab-icon { color: var(--primary); }

.k-tab-count {
  display: inline-grid;
  min-width: 16px;
  height: 16px;
  place-items: center;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--primary);
  color: var(--primary-foreground);
  font-size: 11px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

/* Player head ------------------------------------------------------- */

.k-head {
  display: block;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 4px;
  background: var(--secondary);
  image-rendering: pixelated;
}

.k-head-pixel { image-rendering: pixelated; }

/* Search ------------------------------------------------------------ */

.k-search {
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
}

.k-search-icon {
  position: absolute;
  left: 9px;
  width: 14px;
  height: 14px;
  color: var(--muted-foreground);
  pointer-events: none;
}

.k-search-input {
  width: 100%;
  height: 32px;
  margin: 0;
  padding: 0 10px 0 30px;
  border: 1px solid var(--input);
  border-radius: 8px;
  background: var(--field);
  color: var(--foreground);
  font: inherit;
  font-size: 13px;
  outline: none;
}

.k-search-input::placeholder { color: var(--muted-foreground); }

.k-search-input:focus {
  border-color: color-mix(in oklch, var(--primary) 70%, transparent);
  box-shadow: 0 0 0 2px color-mix(in oklch, var(--primary) 22%, transparent);
}

@media (max-width: 900px) {
  .k-search-input { height: 40px; }
}

/* Switch ------------------------------------------------------------ */

.k-switch {
  position: relative;
  width: 34px;
  height: 20px;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--input);
  cursor: pointer;
  transition: background-color 150ms ease;
}

.k-switch-on { background: var(--primary); }

.k-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--thumb, #fff);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.3);
  transition: transform 150ms ease;
}

.k-switch-on .k-switch-thumb { transform: translateX(14px); }

.k-switch:disabled { opacity: 0.45; cursor: default; }

/* Dialog ------------------------------------------------------------ */

.k-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--overlay);
  backdrop-filter: blur(2px);
}

.k-dialog {
  display: flex;
  width: min(var(--k-dialog-width, 480px), calc(100vw - 32px));
  max-height: 86vh;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--popover);
  color: var(--popover-foreground);
  box-shadow: var(--elevation-pop, 0 16px 32px -8px rgb(0 0 0 / 0.14));
  font-size: 13px;
  outline: none;
}

.k-dialog-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.k-dialog-heading { min-width: 0; flex: 1; }

.k-dialog-heading h2 {
  margin: 0;
  font-size: 15px;
  line-height: 1.25;
  font-weight: 600;
}

.k-dialog-heading p {
  margin: 2px 0 0;
  font-size: 12.5px;
  color: var(--muted-foreground);
}

.k-dialog-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.k-dialog-body {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  padding: 16px 20px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.k-dialog-footer {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--border);
  background: var(--subtle);
}

/* Toasts ------------------------------------------------------------ */

.k-toasts {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 60;
  display: grid;
  gap: 8px;
  width: min(360px, calc(100vw - 32px));
}

.k-toast {
  position: relative;
  display: flex;
  gap: 10px;
  overflow: hidden;
  padding: 12px 14px 12px 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--popover);
  color: var(--popover-foreground);
  box-shadow: var(--elevation-pop, 0 16px 32px -8px rgb(0 0 0 / 0.14));
  font-size: 13px;
}

.k-toast::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  background: var(--k-toast-tone, var(--primary));
}

.k-toast-success { --k-toast-tone: var(--success); }
.k-toast-error { --k-toast-tone: var(--destructive); }
.k-toast-info { --k-toast-tone: var(--primary); }

.k-toast-text { min-width: 0; }

.k-toast-title { font-weight: 500; }

.k-toast-description {
  margin-top: 2px;
  font-size: 12.5px;
  line-height: 1.4;
  color: var(--muted-foreground);
}

/* Inputs ------------------------------------------------------------ */

.k-select-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.k-select-icon {
  position: absolute;
  left: 10px;
  width: 14px;
  height: 14px;
  color: var(--muted-foreground);
  pointer-events: none;
}

.k-select {
  height: 32px;
  margin: 0;
  padding: 0 30px 0 30px;
  border: 1px solid var(--input);
  border-radius: 8px;
  background-color: var(--field);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 14px;
  color: var(--foreground);
  font: inherit;
  font-size: 13px;
  appearance: none;
  cursor: pointer;
}

.k-select:focus {
  outline: none;
  border-color: color-mix(in oklch, var(--primary) 70%, transparent);
  box-shadow: 0 0 0 2px color-mix(in oklch, var(--primary) 22%, transparent);
}

@media (max-width: 900px) {
  .k-select { height: 40px; }
}

.k-spin { animation: k-spin 1s linear infinite; }

@keyframes k-spin {
  to { transform: rotate(360deg); }
}

/* Rows -------------------------------------------------------------- */

.k-panel-search {
  width: min(288px, 100%);
  margin-left: auto;
}

@media (max-width: 640px) {
  .k-panel-head {
    flex-wrap: wrap;
    padding: 8px 16px;
  }
  .k-panel-search {
    width: 100%;
    margin-left: 0;
  }
}

.k-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
}

.k-row:last-child { border-bottom: 0; }

.k-row-clickable {
  cursor: pointer;
  transition: background-color 120ms ease;
}

.k-row-clickable:hover { background: var(--hover); }

.k-row-clickable:focus-visible {
  outline: 2px solid color-mix(in oklch, var(--primary) 70%, transparent);
  outline-offset: -2px;
}

.k-row-main { min-width: 0; flex: 1; }

.k-row-title {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  font-size: 13.5px;
  font-weight: 500;
}

.k-row-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.k-row-uuid {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 4px;
  color: var(--muted-foreground);
}

.k-row-uuid-text {
  overflow: hidden;
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: 11.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.k-row-copy {
  display: inline-flex;
  flex-shrink: 0;
  padding: 2px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  opacity: 0.7;
  cursor: pointer;
}

.k-row-copy:hover { opacity: 1; background: var(--hover); }
.k-row-copy svg { width: 12px; height: 12px; }

.k-row-detail {
  overflow: hidden;
  font-size: 12px;
  color: var(--muted-foreground);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.k-row-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 2px;
  margin-left: auto;
}

.k-icon-btn {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--muted-foreground);
  cursor: pointer;
  transition: background-color 120ms ease, color 120ms ease;
}

.k-icon-btn:hover { background: var(--hover); color: var(--foreground); }
.k-icon-btn svg { width: 16px; height: 16px; }

.k-badge {
  display: inline-flex;
  height: 20px;
  align-items: center;
  gap: 4px;
  padding: 0 6px;
  border-radius: 5px;
  background: var(--secondary);
  color: var(--muted-foreground);
  font-size: 11.5px;
  font-weight: 500;
  white-space: nowrap;
}

/* Loading ----------------------------------------------------------- */

.k-skeleton { padding: 8px 0; }

.k-skeleton-row {
  height: 40px;
  margin: 0 16px 8px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    var(--secondary) 0%,
    color-mix(in oklch, var(--secondary), var(--foreground) 6%) 50%,
    var(--secondary) 100%
  );
  background-size: 200% 100%;
  animation: k-shimmer 1.4s linear infinite;
}

@keyframes k-shimmer {
  to { background-position: -200% 0; }
}

/* List add form ----------------------------------------------------- */

.k-add-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--subtle);
}

.k-input {
  flex: 1 1 180px;
  min-width: 0;
}

.k-add-reason { flex: 1 1 140px; }

.k-icon-danger:hover {
  color: var(--destructive);
  background: color-mix(in oklch, var(--destructive) 12%, transparent);
}

/* Player dialog ------------------------------------------------------ */

.k-dialog-sub {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.k-dialog-uuid {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--muted-foreground);
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 11.5px;
  cursor: pointer;
}

.k-dialog-uuid:hover { color: var(--foreground); }
.k-dialog-uuid svg { width: 12px; height: 12px; }

.k-dialog-stamp {
  margin-right: auto;
  color: var(--muted-foreground);
}

.k-dialog-loading {
  display: grid;
  gap: 8px;
}

.k-dialog-loading .k-skeleton-row { margin: 0; height: 64px; }

/* Sections ----------------------------------------------------------- */

.k-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--foreground);
}

.k-vitals { display: grid; gap: 12px; }

.k-xp {
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--secondary);
}

.k-xp-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--c-green);
  transition: width 300ms ease;
}

.k-hud {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--subtle);
}

.k-hud-icons {
  display: grid;
  grid-auto-flow: column;
  gap: 1px;
}

.k-hud-icon {
  display: inline-flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
}

.k-hud-svg { width: 18px; height: 18px; }

.k-hud-value {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--muted-foreground);
}

.k-vitals-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* Player dialog layout ---------------------------------------------- */

.k-player-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

@media (min-width: 1024px) {
  .k-player-grid { grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); }
}

.k-player-main,
.k-player-side {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.k-section-stack {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.k-coords {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.k-coord {
  min-width: 0;
  padding: 8px 6px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--subtle);
  text-align: center;
}

.k-coord-axis {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}

.k-coord-value {
  margin-top: 2px;
  overflow: hidden;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 15px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--foreground);
}

/* Inventory ---------------------------------------------------------- */

.k-section-switches { margin-left: auto; }

.k-inv { display: grid; gap: 12px; min-width: 0; }

.k-inv-canvas { min-width: 0; }

.k-inv-scroll {
  --k-slot-size: 40px;
  display: flex;
  width: fit-content;
  max-width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  justify-self: center;
  overflow-x: auto;
  padding-bottom: 2px;
}

.k-inv-armor {
  display: flex;
  align-items: center;
  gap: 4px;
}

.k-inv-sep {
  align-self: stretch;
  width: 1px;
  margin: 0 4px;
  background: var(--border);
}

.k-inv-grid {
  display: grid;
  grid-template-columns: repeat(9, var(--k-slot-size));
  gap: 4px;
}

.k-slot {
  position: relative;
  display: grid;
  width: var(--k-slot-size);
  height: var(--k-slot-size);
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--field);
  image-rendering: pixelated;
  transition: background-color 120ms ease, border-color 120ms ease;
}

.k-slot-filled:hover {
  border-color: color-mix(in oklch, var(--primary) 50%, var(--border));
  background: var(--hover);
}

.k-slot-img {
  width: calc(var(--k-slot-size) - 10px);
  height: calc(var(--k-slot-size) - 10px);
  object-fit: contain;
  image-rendering: pixelated;
}

.k-slot-icon {
  width: calc(var(--k-slot-size) - 16px);
  height: calc(var(--k-slot-size) - 16px);
  color: var(--muted-foreground);
  opacity: 0.55;
}

.k-slot-placeholder { display: grid; place-items: center; }

.k-slot-text {
  padding: 1px;
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  word-break: break-all;
  color: var(--foreground);
}

.k-slot-count {
  position: absolute;
  right: 2px;
  bottom: 1px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  color: var(--foreground);
  text-shadow: 0 1px 2px var(--background);
  pointer-events: none;
}

@media (max-width: 900px) {
  .k-inv-scroll { --k-slot-size: 34px; }
}

@media (max-width: 520px) {
  .k-inv-scroll { --k-slot-size: 24px; }

  /* The classic frame adds padding and a bevel, so it needs one step down to fit */
  .k-inv--classic .k-inv-scroll {
    --k-slot-size: 26px;
    padding: 6px;
    border-width: 2px;
  }
}

/* Classic skin: the only place with literal colors, on purpose */

.k-inv--classic .k-inv-scroll {
  padding: 10px 12px;
  border-top: 3px solid #ffffff;
  border-left: 3px solid #ffffff;
  border-bottom: 3px solid #555555;
  border-right: 3px solid #555555;
  background: #c6c6c6;
}

.k-inv--classic .k-slot {
  border: 0;
  border-top: 2px solid #373737;
  border-left: 2px solid #373737;
  border-bottom: 2px solid #ffffff;
  border-right: 2px solid #ffffff;
  border-radius: 0;
  background: #8b8b8b;
}

.k-inv--classic .k-inv-sep { background: #8b8b8b; }

.k-inv--classic .k-slot-text {
  color: #ffffff;
  text-shadow: 1px 1px 0 #000;
}

.k-inv--classic .k-slot-count {
  color: #ffffff;
  text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
}

/* Access ------------------------------------------------------------- */

.k-access { display: grid; gap: 2px; }

.k-access-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.k-access-row:last-child { border-bottom: 0; }

.k-access-text { min-width: 0; }

.k-access-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--foreground);
}

.k-access-hint {
  margin-top: 1px;
  font-size: 12px;
  color: var(--muted-foreground);
}

/* Danger zone -------------------------------------------------------- */

.k-danger { border-color: color-mix(in oklch, var(--destructive) 32%, var(--border)); }

.k-danger-title { color: var(--destructive); }

.k-danger-options { display: grid; gap: 6px; }

.k-check-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--foreground);
  cursor: pointer;
}

.k-check {
  width: 15px;
  height: 15px;
  margin: 0;
  accent-color: var(--destructive);
  cursor: pointer;
}

.k-check-all {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
  color: var(--muted-foreground);
}

.k-danger-note {
  margin: 10px 0 0;
  padding: 8px 10px;
  border: 1px solid color-mix(in oklch, var(--warn) 30%, transparent);
  border-radius: 8px;
  background: color-mix(in oklch, var(--warn) 10%, transparent);
  font-size: 12.5px;
  color: var(--foreground);
}

.k-danger-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: var(--foreground);
}

.k-danger-list li { margin: 2px 0; }

/* Dialog forms ------------------------------------------------------ */

.k-dialog-form {
  display: flex;
  min-height: 0;
  flex-direction: column;
  flex: 1;
}

.k-field { display: grid; gap: 4px; min-width: 0; }

.k-field-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}

.k-field-label-center { text-align: center; }

.k-select-full { width: 100%; }

.k-coord-input { width: 100%; text-align: center; font-variant-numeric: tabular-nums; }

/* Phones: wrap the tab strip instead of hiding tabs behind a scroll */
@media (max-width: 640px) {
  .k-tabs {
    width: 100%;
    flex-wrap: wrap;
  }
  .k-tab {
    flex: 1 1 auto;
  }
}

/* Compact tab bar for panel headers */
.k-tabs-sm {
  padding: 3px;
  gap: 2px;
  border-radius: 10px;
}

.k-tabs-sm .k-tab {
  height: 26px;
  padding: 0 10px;
  gap: 6px;
  border-radius: 7px;
  font-size: 12.5px;
}

.k-tabs-sm .k-tab-count {
  min-width: 14px;
  height: 14px;
  font-size: 10px;
}

/* Inventory layout: armor column on the left, hotbar under a divider */
.k-inv-layout {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.k-inv-armor-col {
  display: grid;
  gap: 4px;
}

.k-inv-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--border);
}

.k-inv--classic .k-inv-bar { border-top-color: #8b8b8b; }

/* Native option list follows the theme, so it stays readable when open */
.k-select option {
  background-color: var(--popover);
  color: var(--popover-foreground);
}

/* Phones: the classic frame needs smaller slots and tighter gaps to fit without scrolling */
@media (max-width: 520px) {
  .k-inv--classic .k-inv-scroll {
    --k-slot-size: 24px;
    padding: 3px;
    border-width: 2px;
  }

  .k-inv--classic .k-inv-grid,
  .k-inv--classic .k-inv-armor-col {
    gap: 3px;
  }
}
`;
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
