import { describe, it, expect } from 'vite-plus/test';
import { formatBytes, formatDuration, truncate } from './format';

describe('formatBytes', () => {
  it('should format bytes with the largest unit', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1023)).toBe('1023 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1024 * 1024 * 120.34)).toBe('120.3 MB');
    expect(formatBytes(1024 ** 3 * 2)).toBe('2.0 GB');
  });
});

describe('formatDuration', () => {
  it('should format durations with the 2 largest units', () => {
    expect(formatDuration(999)).toBe('0s');
    expect(formatDuration(42_000)).toBe('42s');
    expect(formatDuration(125_000)).toBe('2m 05s');
    expect(formatDuration(3_725_000)).toBe('1h 02m');
  });
});

describe('truncate', () => {
  it('should truncate text longer than the max length with an ellipsis', () => {
    expect(truncate('demo.dem', 8)).toBe('demo.dem');
    expect(truncate('demo.dem', 5)).toBe('demo…');
  });
});
