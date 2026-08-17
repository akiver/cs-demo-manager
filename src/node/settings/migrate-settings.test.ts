import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { migrateSettings } from './migrate-settings';

const { installationState } = vi.hoisted(() => {
  return { installationState: { existed: true } };
});

const testFolderPath = path.join(os.tmpdir(), 'csdm-migrate-settings-test');
const settingsFilePath = path.join(testFolderPath, 'settings.json');
const clusterStateFilePath = path.join(testFolderPath, 'postgres', 'state.json');
const clusterDataFolderPath = path.join(testFolderPath, 'postgres', 'pgdata');

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });

vi.mock('./get-settings-file-path', () => {
  return { getSettingsFilePath: () => settingsFilePath };
});
vi.mock('./installation-state', () => {
  return {
    get appFolderExistedAtProcessStart() {
      return installationState.existed;
    },
  };
});
vi.mock('csdm/node/database/embedded/embedded-postgres-paths', () => {
  return {
    getClusterDataFolderPath: () => clusterDataFolderPath,
    getClusterStateFilePath: () => clusterStateFilePath,
  };
});

afterEach(async () => {
  installationState.existed = true;
  await fs.remove(testFolderPath);
});

describe('migrateSettings database recovery', () => {
  it('should select embedded mode for a truly fresh installation', async () => {
    installationState.existed = false;

    const settings = await migrateSettings();

    expect(settings.database.mode).toBe('embedded');
  });

  it('should preserve the legacy external mode when settings disappeared from an existing installation', async () => {
    const settings = await migrateSettings();

    expect(settings.database.mode).toBe('external');
    await expect(fs.readJson(settingsFilePath)).resolves.toMatchObject({ database: { mode: 'external' } });
  });

  it('should recover embedded mode when an existing built-in cluster proves it was selected', async () => {
    await Promise.all([
      fs.outputFile(clusterStateFilePath, '{"password":"secret"}'),
      fs.outputFile(path.join(clusterDataFolderPath, 'PG_VERSION'), '17'),
    ]);

    const settings = await migrateSettings();

    expect(settings.database.mode).toBe('embedded');
  });

  it('should not select embedded mode for a partial cluster folder', async () => {
    await fs.outputFile(clusterStateFilePath, '{"password":"secret"}');

    const settings = await migrateSettings();

    expect(settings.database.mode).toBe('external');
  });

  it('should preserve a corrupted file and recover without silently selecting a new embedded cluster', async () => {
    await fs.outputFile(settingsFilePath, '{broken json');

    const settings = await migrateSettings();

    expect(settings.database.mode).toBe('external');
    const files = await fs.readdir(testFolderPath);
    expect(files.some((file) => file.startsWith('settings.json.corrupted-'))).toBe(true);
  });

  it('should treat structurally invalid JSON as corrupted settings', async () => {
    await fs.outputFile(settingsFilePath, '{}');

    const settings = await migrateSettings();

    expect(settings.database.mode).toBe('external');
    const files = await fs.readdir(testFolderPath);
    expect(files.some((file) => file.startsWith('settings.json.corrupted-'))).toBe(true);
  });
});
