import type { PlayerDetails } from "../../types/player";

export type SectionProps = {
  serverId: string;
  uuid: string;
  player: PlayerDetails;
  /** Something changed; refresh the dashboard lists. */
  onChanged: () => void;
  /** Something changed; refresh this player's details. */
  onRefetch: () => void;
};
