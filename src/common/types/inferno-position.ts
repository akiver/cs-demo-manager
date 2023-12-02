import type { BaseEvent } from 'csdm/common/types/base-event';

export type InfernoPosition = BaseEvent & {
  x: number;
  y: number;
  z: number;
  throwerSteamId: string;
  uniqueId: string;
  convexHell2D: number[];
};
