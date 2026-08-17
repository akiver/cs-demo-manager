import { ErrorCode, type ErrorCode as ErrorCodeType } from 'csdm/common/error-code';
import type { DatabaseOperationError } from 'csdm/server/database-operation-error';

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
  if (typeof error === 'number') {
    code = error as ErrorCodeType;
  } else if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'number') {
    code = error.code as ErrorCodeType;
  }

  return { code, message: formatErrorMessage(error, fallback) };
}
