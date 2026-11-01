import React from "react";
import { NameListTab } from "./NameListTab";

export const WhitelistTab: React.FC<{ serverId: string; onChanged: () => void }> = ({
  serverId,
  onChanged,
}) => <NameListTab serverId={serverId} type="whitelist" onChanged={onChanged} />;
