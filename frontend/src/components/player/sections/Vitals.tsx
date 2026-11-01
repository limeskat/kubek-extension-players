import React from "react";
import { MinecraftFood, MinecraftHeart } from "../../MinecraftIcons";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "../../../ui/empty";
import { getMutationErrorMessage } from "../../../utils/errors";
import { useKubek } from "../../../ui/kubek";
import { Panel, PanelBody, PanelHead, PanelMeta } from "../../../ui/panel";
import { Plate } from "../../../ui/plate";
import { useToast } from "../../../ui/toast";
import type { SectionProps } from "../types";

const healthIcon = (hp: number) => {
  const value = typeof hp === "number" && !Number.isNaN(hp) ? hp : 20;
  return Array.from({ length: 10 }, (_, index) => {
    const slot = (index + 1) * 2;
    const type = value >= slot ? "full" : value >= slot - 1 ? "half" : "empty";
    return (
      <span key={`heart-${index}`} className="k-hud-icon">
        <MinecraftHeart type={type} className="k-hud-svg" />
      </span>
    );
  });
};

const foodIcon = (food: number) => {
  const value = typeof food === "number" && !Number.isNaN(food) ? food : 20;
  return Array.from({ length: 10 }, (_, index) => {
    const slot = (index + 1) * 2;
    const type = value >= slot ? "full" : value >= slot - 1 ? "half" : "empty";
    return (
      <span key={`food-${index}`} className="k-hud-icon">
        <MinecraftFood type={type} className="k-hud-svg" />
      </span>
    );
  });
};

export const Vitals: React.FC<SectionProps> = ({ serverId, uuid, player, onChanged, onRefetch }) => {
  const kubek = useKubek();
  const { ui, http, query, hooks, icons = {} } = kubek;
  const { t } = hooks.useTranslation();
  const { notify } = useToast();

  const vitalsMutation = query.useMutation({
    mutationFn: (action: string) =>
      http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/vitals`, { action }),
    onSuccess: () => {
      onRefetch();
      onChanged();
    },
    onError: (error: unknown) => {
      void getMutationErrorMessage(error).then((message) =>
        notify({ type: "error", title: message }),
      );
    },
  });

  const HeartPulse = icons.HeartPulse || icons.Heart || icons.Activity || (() => null);
  const Utensils = icons.Utensils || icons.Apple || icons.Flame || (() => null);
  const Skull = icons.Skull || (() => null);

  const vitals = player.vitals;
  const online = player.summary.isOnline;
  const pending = vitalsMutation.isPending;
  const disabled = pending || !online;

  return (
    <Panel>
      <PanelHead>
        <Plate tone="green" size="sm">
          <HeartPulse />
        </Plate>
        <span className="k-section-title">{t("ext.players.vitals") || "Vitals"}</span>
        <PanelMeta>Level {vitals?.level ?? 0}</PanelMeta>
      </PanelHead>

      <PanelBody>
        {!vitals ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No vitals recorded</EmptyTitle>
              <EmptyDescription>
                Health and experience appear once the player has joined the server.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="k-vitals">
            <div className="k-xp">
              <div
                className="k-xp-fill"
                style={{ width: `${Math.round((vitals.xpProgress ?? 0) * 100)}%` }}
              />
            </div>

            <div className="k-hud">
              <div className="k-hud-icons">{healthIcon(vitals.health)}</div>
              <span className="k-hud-value">{vitals.health ?? 20} / 20</span>
            </div>

            <div className="k-hud">
              <div className="k-hud-icons">{foodIcon(vitals.food)}</div>
              <span className="k-hud-value">{vitals.food ?? 20} / 20</span>
            </div>

            <div className="k-vitals-actions">
              <ui.Button variant="outline" size="xs" disabled={disabled} onClick={() => vitalsMutation.mutate("heal")}>
                <HeartPulse />
                {t("ext.players.heal") || "Heal"}
              </ui.Button>
              <ui.Button variant="outline" size="xs" disabled={disabled} onClick={() => vitalsMutation.mutate("feed")}>
                <Utensils />
                {t("ext.players.feed") || "Feed"}
              </ui.Button>
              <ui.Button variant="destructive" size="xs" disabled={disabled} onClick={() => vitalsMutation.mutate("kill")}>
                <Skull />
                {t("ext.players.kill") || "Kill"}
              </ui.Button>
              <ui.Button variant="destructive" size="xs" disabled={disabled} onClick={() => vitalsMutation.mutate("starve")}>
                <Skull />
                {t("ext.players.starve") || "Starve"}
              </ui.Button>
            </div>
          </div>
        )}
      </PanelBody>
    </Panel>
  );
};
