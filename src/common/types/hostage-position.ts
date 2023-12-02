import type { HostageState } from 'csdm/common/types/counter-strike';
import type { BaseEvent } from 'csdm/common/types/base-event';

export type HostagePosition = BaseEvent & {
  x: number;
  y: number;
  z: number;
  state: HostageState;
};
