import type { BaseEvent } from 'csdm/common/types/base-event';

export type BombPlantStart = BaseEvent & {
  x: number;
  y: number;
  z: number;
  site: string;
  planterSteamId: string;
  planterName: string;
  isPlanterControllingBot: boolean;
};
