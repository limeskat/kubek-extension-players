import React from "react";
import { getMutationErrorMessage } from "../../utils/errors";
import { useKubek } from "../../ui/kubek";
import { useToast } from "../../ui/toast";
import { buildListPayload, type ListEntry } from "./list-helpers";

export type ListType = "whitelist" | "ops" | "banned-players" | "banned-ips";

/** Shared query + mutations for one access list. */
export function usePlayerList(serverId: string, type: ListType, onChanged: () => void) {
  const kubek = useKubek();
  const { http, query, hooks } = kubek;
  const { t } = hooks.useTranslation();
  const { notify } = useToast();

  const [input, setInput] = React.useState("");
  const [reason, setReason] = React.useState("");

  const listQuery = query.useQuery({
    queryKey: ["ext", "players", serverId, "list", type],
    queryFn: () => http.get(`ext/com.kubek.players/servers/${serverId}/lists/${type}`),
  });

  const showError = React.useCallback(
    (error: unknown) => {
      void getMutationErrorMessage(error).then((message) =>
        notify({ type: "error", title: message }),
      );
    },
    [notify],
  );

  const addMutation = query.useMutation({
    mutationFn: (body: unknown) =>
      http.post(`ext/com.kubek.players/servers/${serverId}/lists/${type}`, body),
    onSuccess: () => {
      setInput("");
      setReason("");
      void listQuery.refetch();
      onChanged();
    },
    onError: showError,
  });

  const deleteMutation = query.useMutation({
    mutationFn: (identifier: string) =>
      http.delete(
        `ext/com.kubek.players/servers/${serverId}/lists/${type}/${encodeURIComponent(identifier)}`,
      ),
    onSuccess: () => {
      void listQuery.refetch();
      onChanged();
    },
    onError: showError,
  });

  const add = () => {
    if (!input.trim()) return;
    addMutation.mutate(buildListPayload(input, reason));
  };

  const entries: ListEntry[] = listQuery.data?.entries || [];

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
    remove: (identifier: string) => deleteMutation.mutate(identifier),
    removePending: deleteMutation.isPending,
  };
}
