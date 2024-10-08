import { glob as tinyGlobby, type GlobOptions } from 'tinyglobby';

export function glob(patterns: string | string[], options?: Omit<GlobOptions, 'patterns'>) {
  return tinyGlobby(patterns, options);
}
