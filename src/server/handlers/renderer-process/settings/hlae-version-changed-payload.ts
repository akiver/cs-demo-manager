import type { ErrorCode } from 'csdm/common/error-code';

export type HlaeVersionChangedPayload = {
  errorCode: ErrorCode | undefined;
  version: string | undefined;
  isUpdateAvailable: boolean;
};
