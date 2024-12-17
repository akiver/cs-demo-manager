import type { DeathNoticesPlayerOptions } from 'csdm/common/types/death-notice-player-options';
import type { CameraFocus } from './camera-focus';

export type Sequence = {
  number: number;
  startTick: number;
  endTick: number;
  showXRay: boolean;
  showOnlyDeathNotices: boolean;
  deathNotices: DeathNoticesPlayerOptions[];
  cameras: CameraFocus[];
  playerVoicesEnabled: boolean;
  cfg?: string;
};
