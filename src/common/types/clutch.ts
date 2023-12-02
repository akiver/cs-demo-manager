import type { TeamNumber } from 'csdm/common/types/counter-strike';
import type { BaseEvent } from 'csdm/common/types/base-event';

export type Clutch = BaseEvent & {
  opponentCount: number;
  side: TeamNumber;
  won: boolean;
  clutcherSteamId: string;
  clutcherName: string;
  hasClutcherSurvived: boolean;
  clutcherKillCount: number;
};
