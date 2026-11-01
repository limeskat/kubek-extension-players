import React from "react";
import { NameListTab } from "./NameListTab";

export const OpsTab: React.FC<{ serverId: string; onChanged: () => void }> = ({
  serverId,
  onChanged,
}) => <NameListTab serverId={serverId} type="ops" onChanged={onChanged} />;
