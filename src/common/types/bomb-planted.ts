import type { BaseEvent } from 'csdm/common/types/base-event';

export type BombPlanted = BaseEvent & {
  site: string;
  planterSteamId: string;
  planterName: string;
  isPlanterControllingBot: boolean;
  x: number;
  y: number;
  z: number;
};
