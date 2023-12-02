import type { TeamNumber } from 'csdm/common/types/counter-strike';
import type { BaseEvent } from 'csdm/common/types/base-event';

export type ChatMessage = BaseEvent & {
  message: string;
  senderIsAlive: boolean;
  senderSide: TeamNumber;
  senderSteamId: string;
  senderName: string;
};
