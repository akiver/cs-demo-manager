import type { BaseEvent } from 'csdm/common/types/base-event';

export type BombExploded = BaseEvent & {
  x: number;
  y: number;
  z: number;
  site: string;
  planterSteamId: string;
  planterName: string;
  isPlanterControllingBot: boolean;
};
