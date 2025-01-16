import type { SequencePlayerOptions } from 'csdm/common/types/sequence-player-options';
import type { CameraFocus } from './camera-focus';

export type Sequence = {
  number: number;
  startTick: number;
  endTick: number;
  showXRay: boolean;
  showOnlyDeathNotices: boolean;
  playersOptions: SequencePlayerOptions[];
  cameras: CameraFocus[];
  playerVoicesEnabled: boolean;
  // @platform win32 Requires HLAE
  deathNoticesDuration: number;
  cfg?: string;
};
