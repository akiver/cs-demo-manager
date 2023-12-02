import { ErrorCode } from './error-code';

export function isErrorCode(error: unknown): error is ErrorCode {
  return typeof error === 'number' && Object.values(ErrorCode).includes(error as ErrorCode);
}
