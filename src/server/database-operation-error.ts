import type { ErrorCode } from 'csdm/common/error-code';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';

export type DatabaseOperationError = {
  code: ErrorCode;
  message: string;
};

export function buildDatabaseOperationError(error: unknown): DatabaseOperationError {
  return {
    code: getErrorCodeFromError(error),
    message: error instanceof Error && error.message !== '' ? error.message : 'Unknown error',
  };
}
