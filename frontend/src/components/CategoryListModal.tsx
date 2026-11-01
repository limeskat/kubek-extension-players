import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { alertMutationError } from "../utils/errors";

interface CategoryListModalProps {
  serverId: string;
  category: "whitelist" | "ops" | "banned-players" | "banned-ips" | null;
  onClose: () => void;
  onChanged: () => void;
}

export const CategoryListModal: React.FC<CategoryListModalProps> = ({
  serverId,
  category,
  onClose,
  onChanged,
}) => {
  const kubek = typeof window !== "undefined" ? window.Kubek : undefined;
  if (!kubek || !category) return null;

  const { ui, icons = {}, http, query, hooks } = kubek;
  const { t } = hooks?.useTranslation?.() || { t: (k: string) => k };

  const [inputValue, setInputValue] = useState("");
  const [reasonValue, setReasonValue] = useState("");

  const isIp = category === "banned-ips";
  const isBan = category === "banned-players" || category === "banned-ips";

  // Category metadata
  const titles: Record<string, string> = {
    whitelist: t("ext.players.whitelist") || "Whitelist",
    ops: t("ext.players.ops") || "Operators (OPs)",
    "banned-players": t("ext.players.banned_players") || "Banned Players",
    "banned-ips": t("ext.players.banned_ips") || "Banned IP Addresses",
  };

  const placeholders: Record<string, string> = {
    whitelist: t("ext.players.placeholder_player") || "Player username (e.g. deiwos)",
    ops: t("ext.players.placeholder_player") || "Player username (e.g. deiwos)",
    "banned-players": t("ext.players.placeholder_player") || "Player username (e.g. deiwos)",
    "banned-ips": t("ext.players.placeholder_ip") || "IP address (e.g. 192.168.1.1)",
  };

  // Fetch current entries
  const listQuery = query.useQuery({
    queryKey: ["ext", "players", serverId, "list", category],
    queryFn: () => http.get<any>(`ext/com.kubek.players/servers/${serverId}/lists/${category}`),
  });

  // Add Mutation
  const addMutation = query.useMutation({
    mutationFn: (body: any) =>
      http.post(`ext/com.kubek.players/servers/${serverId}/lists/${category}`, body),
    onSuccess: () => {
      setInputValue("");
      setReasonValue("");
      listQuery.refetch();
      onChanged();
    },
    onError: alertMutationError,
  });

  // Delete Mutation
  const deleteMutation = query.useMutation({
    mutationFn: (identifier: string) =>
      http.delete(
        `ext/com.kubek.players/servers/${serverId}/lists/${category}/${encodeURIComponent(identifier)}`,
      ),
    onSuccess: () => {
      listQuery.refetch();
      onChanged();
    },
    onError: alertMutationError,
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    addMutation.mutate({
      name: inputValue.trim(),
      ip: inputValue.trim(),
      reason: reasonValue.trim() || undefined,
    });
  };

  const entries: any[] = listQuery.data?.entries || [];

  const UserXIcon = icons.UserX || icons.Users || (() => null);
  const UsersIcon = icons.Users || icons.User || (() => null);
  const XIcon = icons.X || (() => null);
  const RefreshIcon = icons.RefreshCw || (() => null);
  const GlobeIcon = icons.Globe || (() => null);
  const TrashIcon = icons.Trash2 || (() => null);
  const PlusIcon = icons.Plus || (() => null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="bg-card border border-border/80 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "85vh", maxWidth: "640px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg text-white ${isBan ? "bg-rose-600" : "bg-blue-600"}`}>
              {isBan ? <UserXIcon className="w-5 h-5" /> : <UsersIcon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{titles[category]}</h3>
              <p className="text-xs text-muted-foreground">
                {entries.length} {entries.length === 1 ? "entry" : "entries"} recorded
              </p>
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

        {/* Entries List */}
        <div
          className="p-6 flex-1 space-y-2.5"
          style={{ minHeight: 0, overflowY: "auto", overscrollBehavior: "contain" }}
        >
          {listQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <RefreshIcon className="w-6 h-6 animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
              {t("ext.players.no_entries") || "No entries found in this list."}
            </div>
          ) : (
            entries.map((entry, index) => {
              const nameOrIp = entry.name || entry.ip || entry.uuid;
              const avatarUrl = entry.avatarUrl;

              return (
                <div
                  key={entry.uuid || entry.ip || entry.name || index}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/40 transition"
                >
                  <div className="flex items-center gap-3">
                    {isIp ? (
                      <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-mono text-xs font-bold">
                        <GlobeIcon className="w-4 h-4" />
                      </div>
                    ) : (
                      <img
                        src={avatarUrl || `https://mc-heads.net/avatar/${nameOrIp}/36`}
                        alt={nameOrIp}
                        className="w-9 h-9 rounded-lg shadow-inner bg-background object-cover"
                        onError={(e: any) => {
                          e.target.src = "https://mc-heads.net/avatar/MHF_Steve/36";
                        }}
                      />
                    )}
                    <div>
                      <div className="font-semibold text-sm text-foreground">{nameOrIp}</div>
                      {entry.reason && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          Reason: {entry.reason}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(nameOrIp)}
                    disabled={deleteMutation.isPending}
                    className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 transition shadow-sm"
                    title="Remove from list"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Add Input Bar (Bottom) */}
        <form
          onSubmit={handleAdd}
          className="p-4 border-t border-border/50 bg-muted/20 flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholders[category]}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-background border border-border/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
          {isBan && (
            <input
              type="text"
              value={reasonValue}
              onChange={(e) => setReasonValue(e.target.value)}
              placeholder="Ban Reason (optional)"
              className="sm:w-44 px-3 py-2.5 rounded-xl bg-background border border-border/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          )}
          <button
            type="submit"
            disabled={!inputValue.trim() || addMutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <PlusIcon className="w-4 h-4" />
            {t("ext.players.add_entry") || "+ Add"}
          </button>
        </form>
      </div>
    </div>
  );
};
