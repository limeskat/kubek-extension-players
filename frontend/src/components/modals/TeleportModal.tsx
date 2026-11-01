import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { alertMutationError } from "../../utils/errors";

interface TeleportModalProps {
  serverId: string;
  uuid: string;
  username: string;
  isOnline?: boolean;
  currentLocation?: {
    world: string;
    x: number;
    y: number;
    z: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export const TeleportModal: React.FC<TeleportModalProps> = ({
  serverId,
  uuid,
  username,
  isOnline = true,
  currentLocation,
  onClose,
  onSuccess,
}) => {
  const kubek = typeof window !== "undefined" ? window.Kubek : undefined;
  if (!kubek) return null;

  const { ui, icons = {}, http, query, hooks } = kubek;
  const { t } = hooks?.useTranslation?.() || { t: (k: string) => k };

  const [dimension, setDimension] = useState(
    currentLocation?.world || "minecraft:overworld",
  );
  const [x, setX] = useState<number>(currentLocation?.x ?? 0);
  const [y, setY] = useState<number>(currentLocation?.y ?? 64);
  const [z, setZ] = useState<number>(currentLocation?.z ?? 0);

  const tpMutation = query.useMutation({
    mutationFn: (body: any) =>
      http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/teleport`, body),
    onSuccess: () => {
      if (!isOnline) {
        alert(
          `${username}'s new position was saved. It will apply the next time they join.`,
        );
      }
      onSuccess();
      onClose();
    },
    onError: alertMutationError,
  });

  const handleTeleport = (e: React.FormEvent) => {
    e.preventDefault();
    tpMutation.mutate({
      world: dimension,
      x: Number(x),
      y: Number(y),
      z: Number(z),
    });
  };

  const dimensions = [
    { value: "minecraft:overworld", label: "Overworld (minecraft:overworld)" },
    { value: "minecraft:the_nether", label: "The Nether (minecraft:the_nether)" },
    { value: "minecraft:the_end", label: "The End (minecraft:the_end)" },
  ];

  const CompassIcon = icons.Compass || icons.MapPin || (() => null);
  const XIcon = icons.X || (() => null);
  const SparklesIcon = icons.Sparkles || (() => null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="bg-card border border-border/80 w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxWidth: "480px", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-blue-600/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600 text-white shadow-sm">
              <CompassIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">
                {t("ext.players.teleport") || "Teleport"} {username}
              </h3>
              <p className="text-xs text-muted-foreground">Specify target world & coordinates</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleTeleport} className="p-6 space-y-4">
          {!isOnline && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs leading-relaxed">
              {username} is offline. The position is written to their player data and
              applied when they next join.
            </div>
          )}

          {/* Dimension */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
              {t("ext.players.dimension") || "Dimension"}
            </label>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              {dimensions.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Coordinate Steppers */}
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
          >
            {/* X */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1 text-center">
                X
              </label>
              <div className="flex items-center rounded-xl border border-border/80 bg-background overflow-hidden">
                <button
                  type="button"
                  onClick={() => setX((prev: number) => +(Number(prev) - 1).toFixed(2))}
                  className="px-2.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  step="any"
                  value={x}
                  onChange={(e) => setX(parseFloat(e.target.value) || 0)}
                  className="w-full text-center bg-transparent py-2 text-sm focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setX((prev: number) => +(Number(prev) + 1).toFixed(2))}
                  className="px-2.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Y */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1 text-center">
                Y
              </label>
              <div className="flex items-center rounded-xl border border-border/80 bg-background overflow-hidden">
                <button
                  type="button"
                  onClick={() => setY((prev: number) => +(Number(prev) - 1).toFixed(2))}
                  className="px-2.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  step="any"
                  value={y}
                  onChange={(e) => setY(parseFloat(e.target.value) || 0)}
                  className="w-full text-center bg-transparent py-2 text-sm focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setY((prev: number) => +(Number(prev) + 1).toFixed(2))}
                  className="px-2.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Z */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1 text-center">
                Z
              </label>
              <div className="flex items-center rounded-xl border border-border/80 bg-background overflow-hidden">
                <button
                  type="button"
                  onClick={() => setZ((prev: number) => +(Number(prev) - 1).toFixed(2))}
                  className="px-2.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  step="any"
                  value={z}
                  onChange={(e) => setZ(parseFloat(e.target.value) || 0)}
                  className="w-full text-center bg-transparent py-2 text-sm focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setZ((prev: number) => +(Number(prev) + 1).toFixed(2))}
                  className="px-2.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border/70 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
            >
              {t("ext.players.cancel") || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={tpMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <SparklesIcon className="w-4 h-4" />
              {isOnline
                ? t("ext.players.teleport") || "Teleport"
                : t("ext.players.save_position") || "Save position"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
