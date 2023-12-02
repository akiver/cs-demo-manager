import type { BaseEvent } from 'csdm/common/types/base-event';

export type BombDefused = BaseEvent & {
  site: string;
  defuserSteamId: string;
  defuserName: string;
  isDefuserControllingBot: boolean;
  x: number;
  y: number;
  z: number;
  ctAliveCount: number;
  tAliveCount: number;
};
