import React from "react";
import { Empty, EmptyHeader, EmptyTitle } from "../../../ui/empty";
import { formatCoordinate } from "../../../utils/format";
import { useKubek } from "../../../ui/kubek";
import { Panel, PanelBody, PanelHead, PanelMeta } from "../../../ui/panel";
import { Plate } from "../../../ui/plate";
import type { SectionProps } from "../types";

export const LastDeath: React.FC<SectionProps> = ({ player }) => {
  const kubek = useKubek();
  const { hooks, icons = {} } = kubek;
  const { t } = hooks.useTranslation();
  const Skull = icons.Skull || (() => null);

  const death = player.lastDeath;

  return (
    <Panel>
      <PanelHead>
        <Plate tone="amber" size="sm">
          <Skull />
        </Plate>
        <span className="k-section-title">{t("ext.players.last_death") || "Last death"}</span>
        {death ? <PanelMeta>{death.world}</PanelMeta> : null}
      </PanelHead>

      <PanelBody>
        {!death ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No death recorded</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="k-coords" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
            <div className="k-coord">
              <div className="k-coord-axis">X</div>
              <div className="k-coord-value">{formatCoordinate(death.x)}</div>
            </div>
            <div className="k-coord">
              <div className="k-coord-axis">Y</div>
              <div className="k-coord-value">{formatCoordinate(death.y)}</div>
            </div>
            <div className="k-coord">
              <div className="k-coord-axis">Z</div>
              <div className="k-coord-value">{formatCoordinate(death.z)}</div>
            </div>
          </div>
        )}
      </PanelBody>
    </Panel>
  );
};
