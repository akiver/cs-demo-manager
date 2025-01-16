import type { CameraFocus } from 'csdm/common/types/camera-focus';
import type { SequencePlayerOptions } from 'csdm/common/types/sequence-player-options';

export type SequenceForm = {
  number: number;
  startTick: string;
  endTick: string;
  playersOptions: SequencePlayerOptions[];
  cameras: CameraFocus[];
  showXRay: boolean;
  showOnlyDeathNotices: boolean;
  playerVoicesEnabled: boolean;
  // @platform win32 Requires HLAE
  deathNoticesDuration: number;
  cfg?: string;
};
