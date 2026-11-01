import React from "react";
import type { PlayerDetails } from "../../types/player";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "../../ui/dialog";
import { useKubek } from "../../ui/kubek";
import { PlayerHead } from "../../ui/player-head";
import { useToast } from "../../ui/toast";
import { LastDeath } from "./sections/LastDeath";
import { Position } from "./sections/Position";
import { Stats } from "./sections/Stats";
import { Vitals } from "./sections/Vitals";

export const PlayerDetailsDialog: React.FC<{
  serverId: string;
  uuid: string;
  onClose: () => void;
  onChanged: () => void;
}> = ({ serverId, uuid, onClose, onChanged }) => {
  const kubek = useKubek();
  const { http, query, hooks, icons = {}, ui } = kubek;
  const { t } = hooks.useTranslation();
  const { notify } = useToast();

  const detailsQuery = query.useQuery({
    queryKey: ["ext", "players", serverId, "player", uuid],
    queryFn: () => http.get(`ext/com.kubek.players/servers/${serverId}/players/${uuid}`),
    refetchInterval: 6000,
  });

  const details = detailsQuery.data as PlayerDetails | undefined;
  const summary = details?.summary;
  const name = summary?.username || uuid;
  const online = Boolean(summary?.isOnline);
  const Badge: any = ui?.Badge;

  const Refresh = icons.RefreshCw || (() => null);
  const X = icons.X || (() => null);
  const Copy = icons.Copy || (() => null);

  const copyUuid = () => {
    void navigator.clipboard?.writeText(uuid);
    notify({ type: "success", title: t("ext.players.copied") || "Copied to clipboard" });
  };

  const player: PlayerDetails = details ?? {
    summary: { uuid, username: name, isOnline: false },
  };

  return (
    <Dialog open onClose={onClose} label={t("ext.players.details") || "Player details"} width={1040}>
      <DialogHeader
        leading={<PlayerHead name={name} size={40} />}
        title={name}
        description={
          <span className="k-dialog-sub">
            <button type="button" className="k-dialog-uuid" onClick={copyUuid} title="Copy UUID">
              <span>{uuid}</span>
              <Copy />
            </button>
            {Badge ? (
              <>
                <Badge variant={online ? "success" : "secondary"}>
                  {online ? t("ext.players.online") || "Online" : t("ext.players.offline") || "Offline"}
                </Badge>
                {details?.permissions?.isOp ? <Badge variant="warning">OP</Badge> : null}
                {details?.permissions?.isWhitelisted ? (
                  <Badge variant="secondary">{t("ext.players.whitelisted") || "Whitelisted"}</Badge>
                ) : null}
                {details?.permissions?.isBanned ? (
                  <Badge variant="destructive">{t("ext.players.banned") || "Banned"}</Badge>
                ) : null}
              </>
            ) : null}
          </span>
        }
        actions={
          <>
            <ui.Button
              variant="ghost"
              size="icon-sm"
              onClick={() => detailsQuery.refetch()}
              disabled={detailsQuery.isFetching}
              title={t("ext.players.refresh") || "Refresh"}
              aria-label={t("ext.players.refresh") || "Refresh"}
            >
              <Refresh className={detailsQuery.isFetching ? "k-spin" : undefined} />
            </ui.Button>
            <ui.Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              title={t("ext.players.close") || "Close"}
              aria-label={t("ext.players.close") || "Close"}
            >
              <X />
            </ui.Button>
          </>
        }
      />

      <DialogBody>
        {detailsQuery.isLoading && !details ? (
          <div className="k-dialog-loading" aria-busy="true">
            <div className="k-skeleton-row" />
            <div className="k-skeleton-row" />
            <div className="k-skeleton-row" />
          </div>
        ) : (
          <div className="k-player-grid">
            <div className="k-player-main">
              <Vitals
                serverId={serverId}
                uuid={uuid}
                player={player}
                onChanged={onChanged}
                onRefetch={() => detailsQuery.refetch()}
              />
            </div>
            <div className="k-player-side">
              <Position
                serverId={serverId}
                uuid={uuid}
                player={player}
                onChanged={onChanged}
                onRefetch={() => detailsQuery.refetch()}
              />
              <LastDeath
                serverId={serverId}
                uuid={uuid}
                player={player}
                onChanged={onChanged}
                onRefetch={() => detailsQuery.refetch()}
              />
              <Stats
                serverId={serverId}
                uuid={uuid}
                player={player}
                onChanged={onChanged}
                onRefetch={() => detailsQuery.refetch()}
              />
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter>
        <span className="k-dialog-stamp">
          {details?.lastRefreshedText
            ? `Refreshed ${details.lastRefreshedText}`
            : "Live data"}
        </span>
        <ui.Button variant="outline" onClick={onClose}>
          {t("ext.players.close") || "Close"}
        </ui.Button>
      </DialogFooter>
    </Dialog>
  );
};
