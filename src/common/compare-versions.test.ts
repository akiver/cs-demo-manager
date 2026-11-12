import { describe, it, expect } from 'vite-plus/test';
import { compareVersions } from './compare-versions';

describe('compareVersions', () => {
  it('should compare each part numerically', () => {
    expect(compareVersions('10.0', '9.0')).toBeGreaterThan(0);
    expect(compareVersions('9.0', '10.0')).toBeLessThan(0);
    expect(compareVersions('9.10', '9.9')).toBeGreaterThan(0);
  });

  it('should treat missing parts as 0', () => {
    expect(compareVersions('9.0.1', '9.0')).toBeGreaterThan(0);
    expect(compareVersions('9', '9.0.0')).toBe(0);
  });

  it('should return 0 for equal versions', () => {
    expect(compareVersions('8.1', '8.1')).toBe(0);
  });
});
