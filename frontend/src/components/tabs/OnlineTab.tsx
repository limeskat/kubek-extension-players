import React from "react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../../ui/empty";
import { useKubek } from "../../ui/kubek";
import { matchesQuery } from "../../utils/format";
import { Panel, PanelHead, PanelMeta } from "../../ui/panel";
import { SearchInput } from "../../ui/search-input";
import { PlayerRow } from "../player/PlayerRow";

export const OnlineTab: React.FC<{
  players: any[];
  isLoading: boolean;
  emptyIcon?: React.ReactNode;
  onSelectPlayer?: (uuid: string) => void;
}> = ({ players, isLoading, emptyIcon, onSelectPlayer }) => {
  const kubek = useKubek();
  const { t } = kubek?.hooks?.useTranslation?.() ?? { t: (key: string) => key };
  const [query, setQuery] = React.useState("");

  const rows = players.filter((player) => matchesQuery(query, player.username, player.uuid));
  const Badge = kubek?.ui?.Badge;
  const ArrowRight = kubek?.icons?.ArrowRight || (() => null);
  const UsersIcon = kubek?.icons?.Users || (() => null);

  return (
    <Panel>
      <PanelHead>
        <PanelMeta>{players.length} online</PanelMeta>
        {players.length > 0 ? (
          <div className="k-panel-search">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={t("ext.players.search") || "Search players"}
              label={t("ext.players.search") || "Search players"}
            />
          </div>
        ) : null}
      </PanelHead>

      {isLoading ? (
        <div className="k-skeleton" aria-busy="true">
          <div className="k-skeleton-row" />
          <div className="k-skeleton-row" />
          <div className="k-skeleton-row" />
        </div>
      ) : rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia icon={emptyIcon ?? <UsersIcon />} />
            <EmptyTitle>
              {players.length === 0
                ? t("ext.players.no_players_online")
                : t("ext.players.no_matches")}
            </EmptyTitle>
            <EmptyDescription>
              {players.length === 0
                ? t("ext.players.no_players_online_hint")
                : t("ext.players.no_matches_hint")}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="k-rows">
          {rows.map((player) => {
            const key = player.uuid || player.username;
            return (
              <PlayerRow
                key={key}
                name={player.username}
                uuid={player.uuid}
                badges={
                  Badge ? (
                    <Badge variant="success">{t("ext.players.online")}</Badge>
                  ) : (
                    <span className="k-badge">{t("ext.players.online")}</span>
                  )
                }
                onOpen={onSelectPlayer ? () => onSelectPlayer(key) : undefined}
                actions={
                  onSelectPlayer ? (
                    <button
                      type="button"
                      className="k-icon-btn"
                      title={t("ext.players.details")}
                      aria-label={t("ext.players.details")}
                      onClick={() => onSelectPlayer(key)}
                    >
                      <ArrowRight />
                    </button>
                  ) : undefined
                }
              />
            );
          })}
        </div>
      )}
    </Panel>
  );
};
