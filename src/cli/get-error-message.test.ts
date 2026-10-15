import { describe, it, expect } from 'vite-plus/test';
import { ErrorCode } from 'csdm/common/error-code';
import { DemoNotFound } from 'csdm/node/counter-strike/launcher/errors/demo-not-found';
import { getErrorMessage, getErrorStack, isExpectedError } from './get-error-message';
import { CommandError } from './errors/command-error';
import { InvalidArgument } from './errors/invalid-argument';

describe('getErrorMessage', () => {
  it('should return the message of error codes', () => {
    expect(getErrorMessage(ErrorCode.DemoNotFound)).toBe('Demo not found.');
    expect(getErrorMessage(new DemoNotFound())).toBe('Demo not found.');
  });

  it('should append the message of the cause of command errors', () => {
    const error = new CommandError('Failed to retrieve the account', {
      cause: new CommandError('Request failed', { cause: ErrorCode.NetworkError }),
    });

    expect(getErrorMessage(error)).toBe(
      'Failed to retrieve the account\nRequest failed\nA network error occurred, check your internet connection.',
    );
  });

  it('should return the message of other errors', () => {
    expect(getErrorMessage(new Error('Boom'))).toBe('Boom');
    expect(getErrorMessage('Boom')).toBe('Boom');
  });
});

describe('isExpectedError', () => {
  it('should return true for errors with a user-friendly message', () => {
    expect(isExpectedError(new CommandError('Failed'))).toBe(true);
    expect(isExpectedError(new InvalidArgument('Invalid'))).toBe(true);
    expect(isExpectedError(new DemoNotFound())).toBe(true);
    expect(isExpectedError(ErrorCode.DemoNotFound)).toBe(true);
  });

  it('should return false for unexpected errors', () => {
    expect(isExpectedError(new TypeError('Cannot read properties of undefined'))).toBe(false);
    expect(isExpectedError(undefined)).toBe(false);
  });
});

describe('getErrorStack', () => {
  it('should append the stack traces of the causes', () => {
    const cause = new Error('Request failed');
    const error = new CommandError('Failed to retrieve the account', { cause });

    expect(getErrorStack(error)).toBe(`${error.stack}\nCaused by: ${cause.stack}`);
  });

  it('should print error codes used as causes as is', () => {
    const error = new CommandError('Failed to retrieve the account', { cause: ErrorCode.NetworkError });

    expect(getErrorStack(error)).toBe(`${error.stack}\nCaused by: ${ErrorCode.NetworkError}`);
  });
});
