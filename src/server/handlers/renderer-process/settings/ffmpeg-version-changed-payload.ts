import type { ErrorCode } from 'csdm/common/error-code';
import type { FfmpegVersion } from 'csdm/node/video/ffmpeg/get-ffmpeg-version-from-executable';

export type FfmpegVersionChangedPayload = {
  errorCode: ErrorCode | undefined;
  version: FfmpegVersion;
  isUpdateAvailable: boolean;
};
