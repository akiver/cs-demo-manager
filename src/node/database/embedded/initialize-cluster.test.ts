import os from 'node:os';
import path from 'node:path';
import { promises as nodeFs } from 'node:fs';
import fs from 'fs-extra';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { initializeClusterIfNeeded, isClusterInitialized } from './initialize-cluster';

const { runPostgresCommandMock } = vi.hoisted(() => {
  return { runPostgresCommandMock: vi.fn() };
});

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });
vi.mock('./run-postgres-command', () => {
  return { runPostgresCommand: runPostgresCommandMock };
});

const clusterFolderPath = path.join(os.tmpdir(), 'csdm-initialize-cluster-test');
const dataFolderPath = path.join(clusterFolderPath, 'pgdata');

vi.mock('./embedded-postgres-paths', async () => {
  const nodeOs = await import('node:os');
  const nodePath = await import('node:path');
  const folderPath = nodePath.default.join(nodeOs.default.tmpdir(), 'csdm-initialize-cluster-test');

  return {
    getClusterFolderPath: () => folderPath,
    getClusterDataFolderPath: () => nodePath.default.join(folderPath, 'pgdata'),
  };
});

afterEach(async () => {
  runPostgresCommandMock.mockReset();
  vi.restoreAllMocks();
  await fs.remove(clusterFolderPath);
});

describe('isClusterInitialized', () => {
  it('should report a data folder holding PG_VERSION', async () => {
    await expect(isClusterInitialized(dataFolderPath)).resolves.toBe(false);

    await fs.ensureDir(dataFolderPath);
    await fs.writeFile(path.join(dataFolderPath, 'PG_VERSION'), '17\n');

    await expect(isClusterInitialized(dataFolderPath)).resolves.toBe(true);
  });
});

describe('initializeClusterIfNeeded', () => {
  it('should do nothing when the cluster is already initialized', async () => {
    await fs.ensureDir(dataFolderPath);
    await fs.writeFile(path.join(dataFolderPath, 'PG_VERSION'), '17\n');

    await expect(initializeClusterIfNeeded('password')).resolves.toBeUndefined();
  });

  // A cluster whose PG_VERSION was lost would make initdb fail, and deleting the folder would take
  // every analyzed demo with it. It is refused before initdb runs, and nothing is removed.
  it('should keep a data folder it did not create instead of initializing over it', async () => {
    await fs.ensureDir(path.join(dataFolderPath, 'base'));
    await fs.writeFile(path.join(dataFolderPath, 'base', 'user-data'), 'demos');

    await expect(initializeClusterIfNeeded('password')).rejects.toThrow('refusing to overwrite it');

    expect(runPostgresCommandMock).not.toHaveBeenCalled();
    await expect(fs.pathExists(path.join(dataFolderPath, 'base', 'user-data'))).resolves.toBe(true);
    const entries = await fs.readdir(clusterFolderPath);
    expect(entries).toEqual(['pgdata']);
  });

  it('preserves the initialization failure when staging cleanup also fails', async () => {
    const initializationError = new Error('simulated initdb failure');
    const cleanupError = new Error('simulated cleanup failure');
    const originalRemove = fs.remove.bind(fs);
    let stagingRemovalCount = 0;
    vi.spyOn(fs, 'remove').mockImplementation(async (targetPath) => {
      if (String(targetPath).endsWith('.init') && ++stagingRemovalCount === 2) {
        throw cleanupError;
      }
      await originalRemove(targetPath);
    });
    runPostgresCommandMock.mockRejectedValueOnce(initializationError);

    await expect(initializeClusterIfNeeded('password')).rejects.toMatchObject({
      message: expect.stringContaining(initializationError.message),
      cause: initializationError,
    });
  });

  it('removes the password file when writing it fails after creation', async () => {
    const writeError = new Error('simulated write failure');
    let passwordFilePath = '';
    vi.spyOn(fs, 'writeFile').mockImplementationOnce(async (targetPath) => {
      passwordFilePath = String(targetPath);
      await nodeFs.writeFile(passwordFilePath, 'password', { mode: 0o600 });
      throw writeError;
    });

    await expect(initializeClusterIfNeeded('password')).rejects.toMatchObject({ cause: writeError });
    await expect(fs.pathExists(passwordFilePath)).resolves.toBe(false);
  });
});
