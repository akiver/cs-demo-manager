import { ErrorCode } from 'csdm/common/error-code';
import { describe, expect, it } from 'vite-plus/test';
import { buildUiDatabaseOperationError, formatErrorMessage } from './format-error';

describe('formatErrorMessage', () => {
  it('extracts messages from errors, strings, and structured rejections', () => {
    expect(formatErrorMessage(new Error('failure'), 'fallback')).toBe('failure');
    expect(formatErrorMessage('failure', 'fallback')).toBe('failure');
    expect(formatErrorMessage({ message: 'failure' }, 'fallback')).toBe('failure');
  });

  it('uses the fallback for empty and circular values', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(formatErrorMessage(new Error(''), 'Unknown error')).toBe('Unknown error');
    expect(formatErrorMessage('  ', 'Unknown error')).toBe('Unknown error');
    expect(formatErrorMessage(circular, 'Unknown error')).toBe('Unknown error');
  });
});

describe('buildUiDatabaseOperationError', () => {
  it('preserves structured error codes and messages', () => {
    expect(
      buildUiDatabaseOperationError(
        { code: ErrorCode.DatabaseTransitionInProgress, message: 'transition active' },
        'Unknown error',
      ),
    ).toEqual({ code: ErrorCode.DatabaseTransitionInProgress, message: 'transition active' });
  });

  it('preserves known numeric errors', () => {
    expect(buildUiDatabaseOperationError(ErrorCode.NetworkError, 'Unknown error')).toEqual({
      code: ErrorCode.NetworkError,
      message: 'Unknown error',
    });
  });

  it('replaces unknown numeric error codes with UnknownError', () => {
    expect(buildUiDatabaseOperationError(999_999, 'Unknown error')).toEqual({
      code: ErrorCode.UnknownError,
      message: 'Unknown error',
    });
    expect(buildUiDatabaseOperationError({ code: 999_999, message: 'failure' }, 'Unknown error')).toEqual({
      code: ErrorCode.UnknownError,
      message: 'failure',
    });
  });

  it('uses safe fallbacks for malformed structured errors', () => {
    expect(buildUiDatabaseOperationError({ code: 'invalid', message: '' }, 'Unknown error')).toEqual({
      code: ErrorCode.UnknownError,
      message: 'Unknown error',
    });
  });
});
