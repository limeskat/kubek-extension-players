import React from "react";
import { getMutationErrorMessage } from "../../utils/errors";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "../../ui/dialog";
import { useKubek } from "../../ui/kubek";
import { useToast } from "../../ui/toast";

export const TeleportModal: React.FC<{
  serverId: string;
  uuid: string;
  username: string;
  isOnline?: boolean;
  currentLocation?: { world: string; x: number; y: number; z: number };
  onClose: () => void;
  onSuccess: () => void;
}> = ({ serverId, uuid, username, isOnline = true, currentLocation, onClose, onSuccess }) => {
  const kubek = useKubek();
  const { ui, icons = {}, http, query, hooks } = kubek;
  const { t } = hooks.useTranslation();
  const { notify } = useToast();

  const [world, setWorld] = React.useState(currentLocation?.world || "minecraft:overworld");
  const [x, setX] = React.useState(currentLocation?.x ?? 0);
  const [y, setY] = React.useState(currentLocation?.y ?? 64);
  const [z, setZ] = React.useState(currentLocation?.z ?? 0);

  const Sparkles = icons.Sparkles || (() => null);
  const XIcon = icons.X || (() => null);

  const teleport = query.useMutation({
    mutationFn: (body: unknown) =>
      http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/teleport`, body),
    onSuccess: (data: any) => {
      notify({
        type: "success",
        title:
          data?.message ||
          (isOnline
            ? t("ext.players.teleported") || "Player teleported"
            : t("ext.players.player_data_saved") || "Player data saved"),
      });
      onSuccess();
      onClose();
    },
    onError: (error: unknown) => {
      void getMutationErrorMessage(error).then((message) =>
        notify({ type: "error", title: message }),
      );
    },
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    teleport.mutate({ world, x: Number(x), y: Number(y), z: Number(z) });
  };

  const dimensions = [
    { value: "minecraft:overworld", label: "Overworld" },
    { value: "minecraft:the_nether", label: "The Nether" },
    { value: "minecraft:the_end", label: "The End" },
  ];

  const coordinates: Array<{ axis: "X" | "Y" | "Z"; value: number; set: (v: number) => void }> = [
    { axis: "X", value: x, set: setX },
    { axis: "Y", value: y, set: setY },
    { axis: "Z", value: z, set: setZ },
  ];

  return (
    <Dialog open onClose={onClose} label={t("ext.players.teleport") || "Teleport"} width={480}>
      <form className="k-dialog-form" onSubmit={submit}>
        <DialogHeader
          title={`${isOnline ? "Teleport" : "Change position"} · ${username}`}
          description="Pick the target world and coordinates."
          actions={
            <ui.Button variant="ghost" size="icon-sm" type="button" onClick={onClose} aria-label="Close">
              <XIcon />
            </ui.Button>
          }
        />

        <DialogBody>
          {!isOnline ? (
            <p className="k-danger-note">
              {username} is offline. The position is written to their player data and applied the
              next time they join.
            </p>
          ) : null}

          <label className="k-field">
            <span className="k-field-label">{t("ext.players.dimension") || "Dimension"}</span>
            <select
              className="k-select k-select-full"
              value={world}
              onChange={(event) => setWorld(event.target.value)}
            >
              {dimensions.map((dimension) => (
                <option key={dimension.value} value={dimension.value}>
                  {dimension.label}
                </option>
              ))}
            </select>
          </label>

          <div className="k-coords" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
            {coordinates.map((entry) => (
              <label key={entry.axis} className="k-field">
                <span className="k-field-label k-field-label-center">{entry.axis}</span>
                <ui.Input
                  className="k-coord-input"
                  type="number"
                  step="any"
                  value={entry.value}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    entry.set(Number.parseFloat(event.target.value) || 0)
                  }
                />
              </label>
            ))}
          </div>
        </DialogBody>

        <DialogFooter>
          <ui.Button variant="outline" type="button" onClick={onClose}>
            {t("ext.players.cancel") || "Cancel"}
          </ui.Button>
          <ui.Button type="submit" disabled={teleport.isPending}>
            <Sparkles />
            {isOnline
              ? t("ext.players.teleport") || "Teleport"
              : t("ext.players.change_position") || "Change position"}
          </ui.Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
