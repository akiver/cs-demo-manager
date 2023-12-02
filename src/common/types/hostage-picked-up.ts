import type { BaseEvent } from 'csdm/common/types/base-event';

export type HostagePickedUp = BaseEvent & {
  x: number;
  y: number;
  z: number;
  hostageEntityId: number;
  playerSteamId: string;
  isPlayerControllingBot: boolean;
};
