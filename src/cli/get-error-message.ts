import { isErrorCode } from 'csdm/common/is-error-code';
import { BaseError } from 'csdm/node/errors/base-error';
import { getErrorCodeMessage } from './get-error-code-message';
import { CommandError } from './errors/command-error';

/**
 * Returns whether the error is an expected failure that has a user-friendly message, other errors are likely bugs.
 */
export function isExpectedError(error: unknown) {
  return error instanceof CommandError || error instanceof BaseError || isErrorCode(error);
}

export function getErrorMessage(error: unknown): string {
  if (isErrorCode(error)) {
    return getErrorCodeMessage(error);
  }

  if (error instanceof BaseError) {
    return getErrorCodeMessage(error.code);
  }

  if (error instanceof CommandError && error.cause !== undefined) {
    return `${error.message}\n${getErrorMessage(error.cause)}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function getErrorStack(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const stack = error.stack ?? `${error.name}: ${error.message}`;
  if (error.cause === undefined) {
    return stack;
  }

  return `${stack}\nCaused by: ${getErrorStack(error.cause)}`;
}
