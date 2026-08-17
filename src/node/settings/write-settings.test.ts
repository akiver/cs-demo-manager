import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import type { Settings } from './settings';
import { writeSettings } from './write-settings';

const testFolderPath = path.join(os.tmpdir(), 'csdm-write-settings-test');
const settingsFilePath = path.join(testFolderPath, 'settings.json');

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });

vi.mock('./get-settings-file-path', () => {
  return { getSettingsFilePath: () => settingsFilePath };
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.remove(testFolderPath);
});

describe('writeSettings', () => {
  it('should atomically replace an existing settings file', async () => {
    await fs.outputFile(settingsFilePath, '{"previous":true}');

    await writeSettings({ schemaVersion: 14 } as Settings);

    await expect(fs.readJson(settingsFilePath)).resolves.toEqual({ schemaVersion: 14 });
  });

  it('should keep the previous complete file when the atomic replacement fails', async () => {
    await fs.outputFile(settingsFilePath, '{"previous":true}');
    vi.spyOn(fs, 'rename').mockRejectedValueOnce(new Error('simulated rename failure'));

    await expect(writeSettings({ schemaVersion: 14 } as Settings)).rejects.toThrow('simulated rename failure');

    await expect(fs.readFile(settingsFilePath, 'utf8')).resolves.toBe('{"previous":true}');
    const files = await fs.readdir(testFolderPath);
    expect(files).toEqual(['settings.json']);
  });

  it('removes only stale settings temporary files', async () => {
    const staleTemporaryFilePath = path.join(testFolderPath, 'settings.json.old.tmp');
    const currentTemporaryFilePath = path.join(testFolderPath, 'settings.json.current.tmp');
    await fs.outputFile(staleTemporaryFilePath, 'stale');
    await fs.outputFile(currentTemporaryFilePath, 'active');
    const staleDate = new Date(Date.now() - 25 * 60 * 60 * 1000);
    await fs.utimes(staleTemporaryFilePath, staleDate, staleDate);

    await writeSettings({ schemaVersion: 14 } as Settings);

    await expect(fs.pathExists(staleTemporaryFilePath)).resolves.toBe(false);
    await expect(fs.readFile(currentTemporaryFilePath, 'utf8')).resolves.toBe('active');
  });

  it('preserves the write error when temporary-file cleanup also fails', async () => {
    await fs.outputFile(settingsFilePath, '{"previous":true}');
    const writeError = new Error('simulated rename failure');
    vi.spyOn(fs, 'rename').mockRejectedValueOnce(writeError);
    vi.spyOn(fs, 'remove').mockRejectedValueOnce(new Error('simulated cleanup failure'));

    await expect(writeSettings({ schemaVersion: 14 } as Settings)).rejects.toBe(writeError);
    await expect(fs.readFile(settingsFilePath, 'utf8')).resolves.toBe('{"previous":true}');
  });
});
