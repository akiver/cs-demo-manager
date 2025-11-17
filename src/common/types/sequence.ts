import type { SequencePlayerOptions } from 'csdm/common/types/sequence-player-options';
import type { PlayerCameraFocus } from './player-camera-focus';
import type { CustomCameraFocus } from './custom-camera-focus';

export type Sequence = {
  number: number;
  startTick: number;
  endTick: number;
  showXRay: boolean;
  showAssists: boolean;
  showOnlyDeathNotices: boolean;
  playersOptions: SequencePlayerOptions[];
  playerCameras: PlayerCameraFocus[];
  cameras: CustomCameraFocus[];
  playerVoicesEnabled: boolean;
  recordAudio: boolean;
  // @platform win32 Requires HLAE
  deathNoticesDuration: number;
  cfg?: string;
};
