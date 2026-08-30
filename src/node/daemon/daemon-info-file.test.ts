import { describe, it, expect } from 'vite-plus/test';
import { parseDaemonInfo } from './daemon-info-file';
import { isProcessAlive } from '../os/is-process-alive';

describe('parseDaemonInfo', () => {
  it('should parse a valid daemon info file', () => {
    const info = parseDaemonInfo(JSON.stringify({ port: 4574, pid: 1234, version: '1.0.0' }));

    expect(info).toEqual({ port: 4574, pid: 1234, version: '1.0.0' });
  });

  it('should return null for invalid JSON', () => {
    expect(parseDaemonInfo('not json')).toBe(null);
  });

  it('should return null when fields are missing or have the wrong type', () => {
    expect(parseDaemonInfo(JSON.stringify({ port: '4574', pid: 1234, version: '1.0.0' }))).toBe(null);
    expect(parseDaemonInfo(JSON.stringify({ pid: 1234, version: '1.0.0' }))).toBe(null);
    expect(parseDaemonInfo(JSON.stringify({ port: 4574, pid: 1234 }))).toBe(null);
    expect(parseDaemonInfo(JSON.stringify(null))).toBe(null);
  });
});

describe('isProcessAlive', () => {
  it('should return true for the current process', () => {
    expect(isProcessAlive(process.pid)).toBe(true);
  });

  it('should return false for a process that does not exist', () => {
    // PIDs are bounded (Linux default max is ~4 million), this one cannot exist.
    expect(isProcessAlive(2 ** 30)).toBe(false);
  });
});
