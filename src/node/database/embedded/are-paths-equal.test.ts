import { describe, expect, it } from 'vite-plus/test';
import { arePathsEqual } from './are-paths-equal';

describe('arePathsEqual', () => {
  it('normalizes separators and casing for Windows paths on every runner', () => {
    expect(arePathsEqual('C:\\Users\\Demo\\PGDATA', 'c:/users/demo/pgdata/', 'win32')).toBe(true);
  });

  it('keeps path comparisons case-sensitive on POSIX platforms', () => {
    expect(arePathsEqual('/var/lib/PGDATA', '/var/lib/pgdata', 'linux')).toBe(false);
  });
});
