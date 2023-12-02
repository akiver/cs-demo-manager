import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export function getErrorCodeFromError(error: unknown) {
  return error instanceof BaseError ? error.code : ErrorCode.UnknownError;
}
