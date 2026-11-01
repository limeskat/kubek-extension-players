import React from "react";
import { getMutationErrorMessage } from "../../../utils/errors";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "../../../ui/dialog";
import { useKubek } from "../../../ui/kubek";
import { Panel, PanelBody, PanelFoot, PanelHead } from "../../../ui/panel";
import { Plate } from "../../../ui/plate";
import { useToast } from "../../../ui/toast";
import type { SectionProps } from "../types";

type PurgeOptions = {
  playerDataFile: boolean;
  statisticsFile: boolean;
  advancementsFile: boolean;
};

const EMPTY: PurgeOptions = {
  playerDataFile: false,
  statisticsFile: false,
  advancementsFile: false,
};

export const DangerZone: React.FC<SectionProps & { onDeleted?: () => void }> = ({
  serverId,
  uuid,
  player,
  onChanged,
  onRefetch,
  onDeleted,
}) => {
  const kubek = useKubek();
  const { http, query, hooks, icons = {}, ui } = kubek;
  const { t } = hooks.useTranslation();
  const { notify } = useToast();

  const Trash = icons.Trash2 || (() => null);
  const UserX = icons.UserX || icons.User || (() => null);

  const [options, setOptions] = React.useState<PurgeOptions>(EMPTY);
  const [confirming, setConfirming] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const online = player.summary.isOnline;
  const anySelected = Object.values(options).some(Boolean);

  const purgeMutation = query.useMutation({
    mutationFn: (body: PurgeOptions) =>
      http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/purge`, body),
    onSuccess: () => {
      setConfirming(false);
      setOptions(EMPTY);
      onRefetch();
      onChanged();
      notify({
        type: "success",
        title: t("ext.players.purge_done") || "Player data deleted",
      });
    },
    onError: (error: unknown) => {
      void getMutationErrorMessage(error).then((message) =>
        notify({ type: "error", title: message }),
      );
    },
  });

  const deletePlayerMutation = query.useMutation({
    mutationFn: () => http.delete(`ext/com.kubek.players/servers/${serverId}/players/${uuid}`),
    onSuccess: (data: any) => {
      setDeleting(false);
      onChanged();
      notify({
        type: "success",
        title: data?.message || t("ext.players.delete_player_done") || "Player deleted",
      });
      onDeleted?.();
    },
    onError: (error: unknown) => {
      setDeleting(false);
      void getMutationErrorMessage(error).then((message) =>
        notify({ type: "error", title: message }),
      );
    },
  });

  const kickMutation = query.useMutation({
    mutationFn: () =>
      http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/kick`),
    onSuccess: () => {
      onRefetch();
      onChanged();
      notify({ type: "success", title: t("ext.players.kicked") || "Player kicked" });
    },
    onError: (error: unknown) => {
      void getMutationErrorMessage(error).then((message) =>
        notify({ type: "error", title: message }),
      );
    },
  });

  const toggle = (key: keyof PurgeOptions) =>
    setOptions((current) => ({ ...current, [key]: !current[key] }));

  const toggleAll = () => {
    const next = !Object.values(options).every(Boolean);
    setOptions({
      playerDataFile: next,
      statisticsFile: next,
      advancementsFile: next,
    });
  };

  const labels: Array<{ key: keyof PurgeOptions; label: string }> = [
    { key: "playerDataFile", label: "Player data (.dat: XP, inventory, position)" },
    { key: "statisticsFile", label: "Statistics file" },
    { key: "advancementsFile", label: "Advancements file" },
  ];

  return (
    <Panel className="k-tone-red k-danger">
      <PanelHead>
        <Plate tone="red" size="sm">
          <Trash />
        </Plate>
        <span className="k-section-title k-danger-title">
          {t("ext.players.purge_data") || "Delete player data"}
        </span>
      </PanelHead>

      <PanelBody>
        <div className="k-danger-options">
          {labels.map((entry) => (
            <label key={entry.key} className="k-check-row">
              <input
                type="checkbox"
                className="k-check"
                checked={options[entry.key]}
                onChange={() => toggle(entry.key)}
              />
              <span>{entry.label}</span>
            </label>
          ))}
          <label className="k-check-row k-check-all">
            <input
              type="checkbox"
              className="k-check"
              checked={Object.values(options).every(Boolean)}
              onChange={toggleAll}
            />
            <span>Select all categories</span>
          </label>
        </div>

        {online ? (
          <p className="k-danger-note">
            The player is online. Data can only be purged after they disconnect.
          </p>
        ) : null}
      </PanelBody>

      <PanelFoot>
        <ui.Button
          variant="destructive"
          size="sm"
          disabled={!anySelected || online || purgeMutation.isPending}
          onClick={() => setConfirming(true)}
        >
          <Trash />
          {t("ext.players.confirm_purge") || "Delete data"}
        </ui.Button>
        <ui.Button
          variant="outline"
          size="sm"
          disabled={!online || kickMutation.isPending}
          onClick={() => kickMutation.mutate()}
        >
          <UserX />
          {t("ext.players.kick") || "Kick"}
        </ui.Button>
      </PanelFoot>

      <div className="k-danger-delete">
        <div className="k-access-text">
          <div className="k-access-label">
            {t("ext.players.delete_player") || "Delete player"}
          </div>
          <div className="k-access-hint">
            {t("ext.players.delete_player_hint") ||
              "Removes every data file and the usercache entry. They rejoin as a new player."}
          </div>
        </div>
        <ui.Button
          variant="destructive"
          size="sm"
          disabled={online || deletePlayerMutation.isPending}
          onClick={() => setDeleting(true)}
        >
          <Trash />
          {t("ext.players.delete_player") || "Delete player"}
        </ui.Button>
      </div>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        label="Confirm purge"
        width={480}
      >
        <DialogHeader
          title="Delete player data?"
          description={`This cannot be undone for ${player.summary.username}.`}
        />
        <DialogBody>
          <ul className="k-danger-list">
            {labels
              .filter((entry) => options[entry.key])
              .map((entry) => (
                <li key={entry.key}>{entry.label}</li>
              ))}
          </ul>
        </DialogBody>
        <DialogFooter>
          <ui.Button variant="outline" onClick={() => setConfirming(false)}>
            {t("ext.players.cancel") || "Cancel"}
          </ui.Button>
          <ui.Button
            variant="destructive"
            disabled={purgeMutation.isPending}
            onClick={() => purgeMutation.mutate(options)}
          >
            {t("ext.players.confirm_purge") || "Delete data"}
          </ui.Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={deleting} onClose={() => setDeleting(false)} label="Delete player" width={480}>
        <DialogHeader
          title={`Delete ${player.summary.username}?`}
          description="This removes the player from the server completely and cannot be undone."
        />
        <DialogBody>
          <ul className="k-danger-list">
            <li>Player data (.dat and its backup)</li>
            <li>Statistics file</li>
            <li>Advancements file</li>
            <li>usercache.json entry</li>
          </ul>
        </DialogBody>
        <DialogFooter>
          <ui.Button variant="outline" onClick={() => setDeleting(false)}>
            {t("ext.players.cancel") || "Cancel"}
          </ui.Button>
          <ui.Button
            variant="destructive"
            disabled={deletePlayerMutation.isPending}
            onClick={() => deletePlayerMutation.mutate()}
          >
            {t("ext.players.delete_player") || "Delete player"}
          </ui.Button>
        </DialogFooter>
      </Dialog>
    </Panel>
  );
};
