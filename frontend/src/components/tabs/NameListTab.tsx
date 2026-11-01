import React from "react";
import { matchesQuery } from "../../utils/format";
import { useKubek } from "../../ui/kubek";
import { PlayerRow } from "../player/PlayerRow";
import { ListAddForm, ListTab } from "./ListTab";
import { listEntryIdentifier, type ListEntry } from "./list-helpers";
import { usePlayerList, type ListType } from "./usePlayerList";

/** Whitelist and Ops share the exact same shape: a name, a uuid and a remove button. */
export const NameListTab: React.FC<{
  serverId: string;
  type: Extract<ListType, "whitelist" | "ops">;
  onChanged: () => void;
}> = ({ serverId, type, onChanged }) => {
  const kubek = useKubek();
  const list = usePlayerList(serverId, type, onChanged);
  const [query, setQuery] = React.useState("");

  const Trash = kubek?.icons?.Trash2 || (() => null);
  const UserCheck = kubek?.icons?.UserCheck || (() => null);
  const Crown = kubek?.icons?.Crown || (() => null);
  const icon = type === "ops" ? <Crown /> : <UserCheck />;

  const rows = list.entries.filter((entry: ListEntry) =>
    matchesQuery(query, entry.name, entry.uuid),
  );
  const identifier = (entry: ListEntry) => listEntryIdentifier(entry);

  return (
    <ListTab
      meta={`${list.entries.length} entries`}
      total={rows.length}
      query={query}
      onQuery={setQuery}
      loading={list.isLoading}
      empty={{
        icon,
        title: type === "ops" ? "No operators yet" : "The whitelist is empty",
        description:
          type === "ops"
            ? "Grant operator to a player by username."
            : "Add a player by username to allow them in.",
      }}
      addForm={
        <ListAddForm
          value={list.input}
          onChange={list.setInput}
          onSubmit={list.add}
          pending={list.addPending}
          placeholder={list.t("ext.players.placeholder_player") || "Username"}
          submitLabel={list.t("ext.players.add_entry") || "Add"}
        />
      }
    >
      <div className="k-rows">
        {rows.map((entry) => {
          const name = identifier(entry);
          return (
            <PlayerRow
              key={entry.uuid || name}
              name={name}
              uuid={entry.uuid}
              actions={
                <button
                  type="button"
                  className="k-icon-btn k-icon-danger"
                  title="Remove"
                  aria-label="Remove"
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
