import React from "react";
import { matchesQuery } from "../../utils/format";
import { useKubek } from "../../ui/kubek";
import { Plate } from "../../ui/plate";
import { TabBar } from "../../ui/tabs";
import { PlayerRow } from "../player/PlayerRow";
import { ListAddForm, ListTab } from "./ListTab";
import { listEntryIdentifier, type ListEntry } from "./list-helpers";
import { usePlayerList } from "./usePlayerList";

type BanKind = "players" | "ips";

export const BansTab: React.FC<{ serverId: string; onChanged: () => void }> = ({
  serverId,
  onChanged,
}) => {
  const kubek = useKubek();
  const [kind, setKind] = React.useState<BanKind>("players");
  const [query, setQuery] = React.useState("");
  const type = kind === "players" ? "banned-players" : "banned-ips";
  const list = usePlayerList(serverId, type, onChanged);

  const Trash = kubek?.icons?.Trash2 || (() => null);
  const Globe = kubek?.icons?.Globe || (() => null);
  const Ban = kubek?.icons?.Ban || (() => null);
  const Badge: any = kubek?.ui?.Badge;

  const rows = list.entries.filter((entry: ListEntry) =>
    matchesQuery(query, entry.name, entry.ip, entry.uuid, entry.reason),
  );

  return (
    <ListTab
      head={
        <TabBar
          items={[
            { id: "players", label: "Players" },
            { id: "ips", label: "IPs" },
          ]}
          value={kind}
          onChange={(id) => {
            setKind(id as BanKind);
            setQuery("");
          }}
          label="Ban type"
        />
      }
      meta={`${list.entries.length} entries`}
      total={list.entries.length}
      shown={rows.length}
      query={query}
      onQuery={setQuery}
      loading={list.isLoading}
      empty={{
        icon: <Ban />,
        title: kind === "players" ? "No banned players" : "No banned addresses",
        description: "Bans made here are written to the server's ban lists.",
      }}
      noMatches={{
        title: list.t("ext.players.no_matches") || "No matches",
        hint: list.t("ext.players.no_matches_hint") || "Try a different name or UUID.",
      }}
      addForm={
        <ListAddForm
          value={list.input}
          onChange={list.setInput}
          onSubmit={list.add}
          pending={list.addPending}
          placeholder={
            kind === "players"
              ? list.t("ext.players.placeholder_player") || "Username"
              : list.t("ext.players.placeholder_ip") || "IP address"
          }
          submitLabel={list.t("ext.players.add_entry") || "Ban"}
          reason={list.reason}
          onReason={list.setReason}
          reasonPlaceholder="Reason (optional)"
        />
      }
    >
      <div className="k-rows">
        {rows.map((entry) => {
          const name = listEntryIdentifier(entry);
          return (
            <PlayerRow
              key={name}
              name={name}
              uuid={kind === "players" ? entry.uuid : undefined}
              head={
                kind === "ips" ? (
                  <Plate tone="red" size="lg">
                    <Globe />
                  </Plate>
                ) : undefined
              }
              badges={
                Badge ? <Badge variant="destructive">Banned</Badge> : <span className="k-badge">Banned</span>
              }
              detail={entry.reason || undefined}
              actions={
                <button
                  type="button"
                  className="k-icon-btn k-icon-danger"
                  title="Pardon"
                  aria-label="Pardon"
                  disabled={list.removePending}
                  onClick={() => list.remove(name)}
                >
                  <Trash />
                </button>
              }
            />
          );
        })}
      </div>
    </ListTab>
  );
};
