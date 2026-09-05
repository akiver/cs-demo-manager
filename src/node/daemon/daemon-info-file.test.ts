import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vite-plus/test';
import { parseDaemonInfo, writeDaemonInfoFile, readDaemonInfoFile, deleteDaemonInfoFile } from './daemon-info-file';
import { isProcessAlive } from '../os/is-process-alive';

const appFolderPath = path.join(os.tmpdir(), `csdm-daemon-info-file-test-${process.pid}`);

vi.mock('csdm/node/filesystem/get-app-folder-path', () => {
  return {
    getAppFolderPath: () => appFolderPath,
  };
});

vi.stubGlobal('logger', {
  log: vi.fn(),
  error: vi.fn(),
});

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

describe('deleteDaemonInfoFile', () => {
  beforeEach(async () => {
    await fs.remove(appFolderPath);
  });

  afterEach(async () => {
    await fs.remove(appFolderPath);
  });

  it('should delete the file written by the given pid', async () => {
    await writeDaemonInfoFile({ port: 4574, pid: 1234, version: '1.0.0' });

    await deleteDaemonInfoFile(1234);

    expect(await readDaemonInfoFile()).toBe(null);
  });

  it('should keep the file when it belongs to another daemon', async () => {
    await writeDaemonInfoFile({ port: 4575, pid: 5678, version: '1.0.0' });

    await deleteDaemonInfoFile(1234);

    expect(await readDaemonInfoFile()).toEqual({ port: 4575, pid: 5678, version: '1.0.0' });
  });

  it('should not fail when the file does not exist', async () => {
    await expect(deleteDaemonInfoFile(1234)).resolves.toBeUndefined();
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
