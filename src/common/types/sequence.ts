import type { DeathNoticesPlayerOptions } from 'csdm/common/types/death-notice-player-options';
import type { CameraFocus } from './camera-focus';

export type Sequence = {
  number: number;
  startTick: number;
  endTick: number;
  showXRay: boolean;
  deathNotices: DeathNoticesPlayerOptions[];
  cameraFocus: CameraFocus;
  playerFocusSteamId?: string;
  playerFocusName?: string;
  playerVoicesEnabled: boolean;
  cfg?: string;
};
