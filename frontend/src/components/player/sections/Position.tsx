import React from "react";
import { Empty, EmptyHeader, EmptyTitle } from "../../../ui/empty";
import { formatCoordinate } from "../../../utils/format";
import { useKubek } from "../../../ui/kubek";
import { Panel, PanelBody, PanelHead, PanelMeta } from "../../../ui/panel";
import { Plate } from "../../../ui/plate";
import type { SectionProps } from "../types";

const Coord: React.FC<{ axis: string; value: number }> = ({ axis, value }) => (
  <div className="k-coord">
    <div className="k-coord-axis">{axis}</div>
    <div className="k-coord-value">{formatCoordinate(value)}</div>
  </div>
);

export const Position: React.FC<SectionProps & { onTeleport?: () => void }> = ({
  player,
  onTeleport,
}) => {
  const kubek = useKubek();
  const { hooks, icons = {}, ui } = kubek;
  const { t } = hooks.useTranslation();

  const MapPin = icons.MapPin || (() => null);
  const Sparkles = icons.Sparkles || (() => null);

  const location = player.location;
  const online = player.summary.isOnline;

  return (
    <Panel>
      <PanelHead>
        <Plate tone="cyan" size="sm">
          <MapPin />
        </Plate>
        <span className="k-section-title">
          {online
            ? t("ext.players.position") || "Current position"
            : t("ext.players.last_position") || "Last known position"}
        </span>
        {location ? <PanelMeta>{location.world}</PanelMeta> : null}
      </PanelHead>

      <PanelBody>
        {!location ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No position recorded</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="k-section-stack">
            <div className="k-coords" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
              <Coord axis="X" value={location.x} />
              <Coord axis="Y" value={location.y} />
              <Coord axis="Z" value={location.z} />
            </div>

            <ui.Button variant="outline" size="sm" disabled={!onTeleport} onClick={onTeleport}>
              <Sparkles />
              {online
                ? t("ext.players.teleport") || "Teleport"
                : t("ext.players.save_position") || "Save position"}
            </ui.Button>
          </div>
        )}
      </PanelBody>
    </Panel>
  );
};
