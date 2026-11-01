import React from "react";
import { getMutationErrorMessage } from "../../../utils/errors";
import { useKubek } from "../../../ui/kubek";
import { Panel, PanelBody, PanelHead } from "../../../ui/panel";
import { Plate } from "../../../ui/plate";
import { Switch } from "../../../ui/switch";
import { useToast } from "../../../ui/toast";
import type { SectionProps } from "../types";

export const Access: React.FC<SectionProps> = ({ serverId, uuid, player, onChanged, onRefetch }) => {
  const kubek = useKubek();
  const { http, query, hooks, icons = {} } = kubek;
  const { t } = hooks.useTranslation();
  const { notify } = useToast();
  const Shield = icons.Shield || icons.UserCheck || (() => null);

  const permissionMutation = query.useMutation({
    mutationFn: (body: { perm: string; value: boolean }) =>
      http.post(`ext/com.kubek.players/servers/${serverId}/players/${uuid}/permissions`, body),
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

  const permissions = player.permissions;
  const pending = permissionMutation.isPending;

  const rows = [
    {
      perm: "whitelist",
      label: t("ext.players.whitelisted") || "Whitelisted",
      hint: "Allowed to join when the whitelist is enforced.",
      value: permissions?.isWhitelisted,
    },
    {
      perm: "op",
      label: t("ext.players.operator") || "Operator",
      hint: "Granted operator permissions on this server.",
      value: permissions?.isOp,
    },
    {
      perm: "ban",
      label: t("ext.players.banned") || "Banned",
      hint: "Blocked from joining this server.",
      value: permissions?.isBanned,
    },
  ];

  return (
    <Panel>
      <PanelHead>
        <Plate tone="gray" size="sm">
          <Shield />
        </Plate>
        <span className="k-section-title">Access</span>
      </PanelHead>
      <PanelBody>
        <div className="k-access">
          {rows.map((row) => (
            <div key={row.perm} className="k-access-row">
              <div className="k-access-text">
                <div className="k-access-label">{row.label}</div>
                <div className="k-access-hint">{row.hint}</div>
              </div>
              {row.value === undefined ? (
                <span className="k-badge">Unknown</span>
              ) : (
                <Switch
                  checked={row.value}
                  disabled={pending}
                  label={row.label}
                  onChange={(next) => permissionMutation.mutate({ perm: row.perm, value: next })}
                />
              )}
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
};
