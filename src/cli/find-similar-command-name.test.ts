import { describe, it, expect } from 'vite-plus/test';
import { findSimilarCommandName } from './find-similar-command-name';

const commandNames = ['analyze', 'dl-valve', 'dl-faceit', 'help', 'json', 'xlsx', 'video'];

describe('findSimilarCommandName', () => {
  it('should return the command with a single typo', () => {
    expect(findSimilarCommandName('analyse', commandNames)).toBe('analyze');
    expect(findSimilarCommandName('dl-vlave', commandNames)).toBe('dl-valve');
  });

  it('should return the command with swapped characters', () => {
    expect(findSimilarCommandName('vidoe', commandNames)).toBe('video');
  });

  it('should ignore the case', () => {
    expect(findSimilarCommandName('JSON', commandNames)).toBe('json');
  });

  it('should return undefined when no command is close enough', () => {
    expect(findSimilarCommandName('download', commandNames)).toBeUndefined();
    expect(findSimilarCommandName('foo', commandNames)).toBeUndefined();
  });
});
