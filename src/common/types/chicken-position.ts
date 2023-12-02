import type { BaseEvent } from 'csdm/common/types/base-event';

export type ChickenPosition = BaseEvent & {
  x: number;
  y: number;
  z: number;
};
