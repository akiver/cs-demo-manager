import type { DeathNoticesPlayerOptions } from 'csdm/common/types/death-notice-player-options';

export type Sequence = {
  number: number;
  startTick: number;
  endTick: number;
  deathNotices: DeathNoticesPlayerOptions[];
  playerFocusSteamId?: string;
  cfg?: string;
};
