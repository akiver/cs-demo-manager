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
});
