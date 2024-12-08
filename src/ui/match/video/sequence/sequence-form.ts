import type { CameraFocus } from 'csdm/common/types/camera-focus';
import type { DeathNoticesPlayerOptions } from 'csdm/common/types/death-notice-player-options';

export type SequenceForm = {
  number: number;
  startTick: string;
  endTick: string;
  deathNotices: DeathNoticesPlayerOptions[];
  cameraFocus: CameraFocus;
  playerFocusSteamId?: string;
  showXRay: boolean;
  playerVoicesEnabled: boolean;
  cfg?: string;
};
