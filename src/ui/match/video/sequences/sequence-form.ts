import type { DeathNoticesPlayerOptions } from 'csdm/common/types/death-notice-player-options';

export type SequenceForm = {
  number: number;
  startTick: string;
  endTick: string;
  deathNotices: DeathNoticesPlayerOptions[];
  playerFocusSteamId?: string;
  showXRay: boolean;
  cfg?: string;
};
