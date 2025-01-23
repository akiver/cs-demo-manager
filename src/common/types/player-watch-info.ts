import type { TeamNumber } from './counter-strike';

export type PlayerWatchInfo = {
  steamId: string;
  slot: number;
  userId: number;
  side: TeamNumber;
};
