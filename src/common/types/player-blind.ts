import type { TeamNumber } from 'csdm/common/types/counter-strike';
import type { BaseEvent } from 'csdm/common/types/base-event';

export type PlayerBlind = BaseEvent & {
  duration: number;
  flasherSteamId: string;
  flasherName: string;
  flasherSide: TeamNumber;
  isFlasherControllingBot: boolean;
  flashedSteamId: string;
  flashedName: string;
  flashedSide: TeamNumber;
  isFlashedControllingBot: boolean;
};
