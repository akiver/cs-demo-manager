import type { ErrorCode } from 'csdm/common/error-code';

export type FfmpegVersionChangedPayload = {
  errorCode: ErrorCode | undefined;
  version: string | undefined;
  isUpdateAvailable: boolean;
};
