import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { initializeClusterIfNeeded, isClusterInitialized } from './initialize-cluster';

const { runPostgresCommandMock } = vi.hoisted(() => {
  return { runPostgresCommandMock: vi.fn() };
});

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

  // A cluster whose PG_VERSION was lost makes initdb fail, and deleting the folder would take every
  // analyzed demo with it. initdb runs in a folder of its own, so nothing else can be removed.
  it('should keep a data folder it did not create when the initialization fails', async () => {
    await fs.ensureDir(path.join(dataFolderPath, 'base'));
    await fs.writeFile(path.join(dataFolderPath, 'base', 'user-data'), 'demos');

    runPostgresCommandMock.mockRejectedValueOnce(new Error('simulated initdb failure'));
    await expect(initializeClusterIfNeeded('password')).rejects.toThrow('Failed to create the built-in database');

    await expect(fs.pathExists(path.join(dataFolderPath, 'base', 'user-data'))).resolves.toBe(true);
    const entries = await fs.readdir(clusterFolderPath);
    expect(entries).toEqual(['pgdata']);
  });
});
