import { describe, it, expect } from 'vite-plus/test';
import { findSimilarName } from './find-similar-name';

const names = ['analyze', 'dl-valve', 'dl-faceit', 'help', 'json', 'xlsx', 'video'];

describe('findSimilarName', () => {
  it('should return the command with a single typo', () => {
    expect(findSimilarName('analyse', names)).toBe('analyze');
    expect(findSimilarName('dl-vlave', names)).toBe('dl-valve');
  });

  it('should return the command with swapped characters', () => {
    expect(findSimilarName('vidoe', names)).toBe('video');
  });

  it('should ignore the case', () => {
    expect(findSimilarName('JSON', names)).toBe('json');
  });

  it('should return undefined when no command is close enough', () => {
    expect(findSimilarName('download', names)).toBeUndefined();
    expect(findSimilarName('foo', names)).toBeUndefined();
  });
});
