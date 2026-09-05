import { ErrorCode } from 'csdm/common/error-code';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';

/**
 * Throws the error's ErrorCode when it has one or the error's message otherwise.
 * For handlers whose client prints messages as is (e.g. the CLI): an unexpected error is more useful with its own
 * message than as a generic "unknown error".
 */
export function throwErrorCodeOrMessage(error: unknown, logMessage: string): never {
  const errorCode = getErrorCodeFromError(error);
  if (errorCode !== ErrorCode.UnknownError) {
    throw errorCode;
  }

  logger.error(logMessage);
  logger.error(error);

  throw error instanceof Error ? error.message : 'Unknown error';
}
