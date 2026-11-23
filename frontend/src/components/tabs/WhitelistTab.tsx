/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from "../../ui/react";
import { NameListTab } from "./NameListTab";

export const WhitelistTab: React.FC<{ serverId: string; onChanged: () => void }> = ({
  serverId,
  onChanged,
}) => <NameListTab serverId={serverId} type="whitelist" onChanged={onChanged} />;
