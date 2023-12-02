import type { BaseEvent } from './base-event';

export type BombDefuseStart = BaseEvent & {
  x: number;
  y: number;
  z: number;
  defuserSteamId: string;
  defuserName: string;
  isDefuserControllingBot: boolean;
};
