import React from "react";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "../../../ui/empty";
import { KeyValue, KeyValueItem } from "../../../ui/key-value";
import { useKubek } from "../../../ui/kubek";
import { Panel, PanelBody, PanelHead } from "../../../ui/panel";
import { Plate } from "../../../ui/plate";
import type { SectionProps } from "../types";

const number = (value: number | undefined, suffix = "") =>
  value === undefined || value === null ? "—" : `${value.toLocaleString()}${suffix}`;

export const Stats: React.FC<SectionProps> = ({ player }) => {
  const kubek = useKubek();
  const { hooks, icons = {} } = kubek;
  const { t } = hooks.useTranslation();
  const Chart = icons.ChartColumn || icons.BarChart3 || icons.BarChart || (() => null);

  const stats = player.stats;

  return (
    <Panel>
      <PanelHead>
        <Plate tone="purple" size="sm">
          <Chart />
        </Plate>
        <span className="k-section-title">
          {t("ext.players.stats") || "Gameplay statistics"}
        </span>
      </PanelHead>

      <PanelBody>
        {!stats ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No statistics recorded</EmptyTitle>
              <EmptyDescription>
                Statistics appear once the player has a statistics file on disk.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <KeyValue>
            <KeyValueItem label={t("ext.players.playtime") || "Playtime"}>
              {stats.playtimeText || "0m"}
            </KeyValueItem>
            <KeyValueItem label={t("ext.players.kills") || "Player kills"}>
              {number(stats.playerKills)}
            </KeyValueItem>
            <KeyValueItem label={t("ext.players.deaths") || "Deaths"}>
              {number(stats.deaths)}
            </KeyValueItem>
            <KeyValueItem label={t("ext.players.kdr") || "KDR"}>{number(stats.kdr)}</KeyValueItem>
            <KeyValueItem label={t("ext.players.distance_total") || "Distance travelled"}>
              {number(stats.distanceTotal, " blocks")}
            </KeyValueItem>
            <KeyValueItem label={t("ext.players.distance_walked") || "Distance walked"}>
              {number(stats.distanceWalked, " blocks")}
            </KeyValueItem>
            <KeyValueItem label={t("ext.players.distance_sprinted") || "Distance sprinted"}>
              {number(stats.distanceSprinted, " blocks")}
            </KeyValueItem>
            <KeyValueItem label={t("ext.players.blocks_broken") || "Blocks broken"}>
              {number(stats.blocksBroken)}
            </KeyValueItem>
            <KeyValueItem label={t("ext.players.items_used") || "Items used"}>
              {number(stats.itemsUsed)}
            </KeyValueItem>
            <KeyValueItem label={t("ext.players.entities_killed") || "Entities killed"}>
              {number(stats.entitiesKilled)}
            </KeyValueItem>
          </KeyValue>
        )}
      </PanelBody>
    </Panel>
  );
};
