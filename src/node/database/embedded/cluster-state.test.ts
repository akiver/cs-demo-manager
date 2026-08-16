import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { EmbeddedPostgresStateMissing } from './errors/embedded-postgres-state-missing';
import { readOrCreateClusterState, writeClusterState } from './cluster-state';

const clusterFolderPath = path.join(os.tmpdir(), 'csdm-cluster-state-test');
const stateFilePath = path.join(clusterFolderPath, 'state.json');

vi.mock('./embedded-postgres-paths', async () => {
  const nodeOs = await import('node:os');
  const nodePath = await import('node:path');
  const folderPath = nodePath.default.join(nodeOs.default.tmpdir(), 'csdm-cluster-state-test');

  return {
    getClusterFolderPath: () => folderPath,
    getClusterStateFilePath: () => nodePath.default.join(folderPath, 'state.json'),
  };
});

afterEach(async () => {
  await fs.remove(clusterFolderPath);
});

describe('readOrCreateClusterState', () => {
  it('should generate a password when there is no cluster yet', async () => {
    const state = await readOrCreateClusterState(false);

    expect(state.password).not.toBe('');
    await expect(readOrCreateClusterState(false)).resolves.toEqual(state);
  });

  it('should return the persisted state', async () => {
    await writeClusterState({ password: 'password', port: 54_321 });

    await expect(readOrCreateClusterState(true)).resolves.toEqual({ password: 'password', port: 54_321 });
  });

  // Generating a new password for an initialized cluster overwrites the only copy of the one the
  // cluster actually expects, every connection would fail from then on.
  it('should throw when the state of an initialized cluster is missing', async () => {
    await expect(readOrCreateClusterState(true)).rejects.toThrow(EmbeddedPostgresStateMissing);
  });

  it('should throw when the state of an initialized cluster is corrupted', async () => {
    await fs.ensureDir(clusterFolderPath);
    await fs.writeFile(stateFilePath, '{"password":');

    await expect(readOrCreateClusterState(true)).rejects.toThrow(EmbeddedPostgresStateMissing);
  });

  it('should throw when the state of an initialized cluster has no password', async () => {
    await fs.ensureDir(clusterFolderPath);
    await fs.writeFile(stateFilePath, JSON.stringify({ port: 54_321 }));

    await expect(readOrCreateClusterState(true)).rejects.toThrow(EmbeddedPostgresStateMissing);
  });
});
