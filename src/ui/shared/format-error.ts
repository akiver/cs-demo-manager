import { ErrorCode, type ErrorCode as ErrorCodeType } from 'csdm/common/error-code';
import type { DatabaseOperationError } from 'csdm/server/database-operation-error';
import { isErrorCode } from 'csdm/common/is-error-code';

export function formatErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }
  if (typeof error === 'string' && error.trim() !== '') {
    return error;
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.trim() !== ''
  ) {
    return error.message;
  }

  return fallback;
}

export function buildUiDatabaseOperationError(error: unknown, fallback: string): DatabaseOperationError {
  let code: ErrorCodeType = ErrorCode.UnknownError;
  if (isErrorCode(error)) {
    code = error;
  } else if (typeof error === 'object' && error !== null && 'code' in error && isErrorCode(error.code)) {
    code = error.code;
  }

  return { code, message: formatErrorMessage(error, fallback) };
}
