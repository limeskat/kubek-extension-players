import React from "react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../../ui/empty";
import { Panel } from "../../ui/panel";

export const OnlineTab: React.FC<{
  players: any[];
  isLoading: boolean;
  emptyIcon?: React.ReactNode;
}> = ({ players, isLoading, emptyIcon }) => (
  <Panel>
    <Empty>
      <EmptyHeader>
        <EmptyMedia icon={emptyIcon} />
        <EmptyTitle>Online</EmptyTitle>
        <EmptyDescription>{isLoading ? "Loading…" : `${players.length} players`}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  </Panel>
);
