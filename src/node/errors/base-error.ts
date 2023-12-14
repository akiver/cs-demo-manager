import type { ErrorCode } from 'csdm/common/error-code';

export class BaseError extends Error {
  public code: ErrorCode;

  public constructor(code: ErrorCode, cause?: unknown) {
    super();
    this.code = code;
    this.cause = cause;
  }
}
