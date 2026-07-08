import type { SequencePlayerOptions } from 'csdm/common/types/sequence-player-options';
import type { PlayerCameraFocus } from './player-camera-focus';
import type { CustomCameraFocus } from './custom-camera-focus';

export type Sequence = {
  /**
   * The sequence number defines the order of the sequence in the final video, not during recording.
   * It means that a sequence can be recorded in any order, but it will be sorted by number when generating the final video.
   */
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
