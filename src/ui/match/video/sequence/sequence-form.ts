import type { PlayerCameraFocus } from 'csdm/common/types/player-camera-focus';
import type { CustomCameraFocus } from 'csdm/common/types/custom-camera-focus';
import type { SequencePlayerOptions } from 'csdm/common/types/sequence-player-options';

export type SequenceForm = {
  number: number;
  startTick: string;
  endTick: string;
  playersOptions: SequencePlayerOptions[];
  playerCameras: PlayerCameraFocus[];
  cameras: CustomCameraFocus[];
  showXRay: boolean;
  showAssists: boolean;
  showOnlyDeathNotices: boolean;
  playerVoicesEnabled: boolean;
  recordAudio: boolean;
  // @platform win32 Requires HLAE
  deathNoticesDuration: number;
  cfg?: string;
};
