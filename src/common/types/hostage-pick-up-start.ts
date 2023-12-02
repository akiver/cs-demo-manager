import type { BaseEvent } from 'csdm/common/types/base-event';

export type HostagePickUpStart = BaseEvent & {
  x: number;
  y: number;
  z: number;
  playerSteamId: string;
  isPlayerControllingBot: boolean;
  hostageEntityId: number;
};
