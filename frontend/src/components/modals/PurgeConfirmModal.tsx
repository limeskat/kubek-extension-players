import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

interface PurgeConfirmModalProps {
  username: string;
  options: {
    experiencePoints: boolean;
    inventory: boolean;
    enderChest: boolean;
    playerDataFile: boolean;
    statisticsFile: boolean;
    advancementsFile: boolean;
  };
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export const PurgeConfirmModal: React.FC<PurgeConfirmModalProps> = ({
  username,
  options,
  onConfirm,
  onCancel,
  isPending,
}) => {
  const kubek = typeof window !== "undefined" ? window.Kubek : undefined;
  const icons = kubek?.icons || {};

  const AlertTriangleIcon = icons.AlertTriangle || icons.ShieldAlert || (() => null);
  const TrashIcon = icons.Trash2 || (() => null);
  const XIcon = icons.X || (() => null);

  const selectedItems: string[] = [];
  if (options.experiencePoints) selectedItems.push("Experience points & Level");
  if (options.inventory) selectedItems.push("Player inventory & Hotbar items");
  if (options.enderChest) selectedItems.push("Ender Chest contents");
  if (options.playerDataFile) selectedItems.push("World playerdata file (.dat)");
  if (options.statisticsFile) selectedItems.push("Gameplay statistics file (.json)");
  if (options.advancementsFile) selectedItems.push("Advancements & Progress (.json)");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-rose-500/40 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-rose-500/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <AlertTriangleIcon className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-foreground">
              Confirm Data Deletion
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm">
          <p className="text-muted-foreground leading-relaxed">
            Are you sure you want to permanently delete the selected data for player{" "}
            <span className="font-extrabold text-foreground">{username}</span>?
          </p>

          {/* Selected Categories */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              Selected data categories ({selectedItems.length}):
            </div>
            <ul className="space-y-1 text-xs text-foreground/90">
              {selectedItems.map((item, idx) => (
                <li key={`purge-item-${idx}`} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            ⚠️ This operation cannot be undone. Backup files are recommended before proceeding.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/50 bg-muted/20">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" />
            {isPending ? "Deleting..." : "Yes, Delete Data"}
          </button>
        </div>
      </div>
    </div>
  );
};
