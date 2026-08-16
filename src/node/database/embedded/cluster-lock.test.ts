import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { withClusterLock } from './cluster-lock';

const clusterFolderPath = path.join(os.tmpdir(), 'csdm-cluster-lock-test');

vi.mock('./embedded-postgres-paths', async () => {
  const nodeOs = await import('node:os');
  const nodePath = await import('node:path');
  const folderPath = nodePath.default.join(nodeOs.default.tmpdir(), 'csdm-cluster-lock-test');

  return {
    getClusterFolderPath: () => folderPath,
    // The parent folder is never created: writing the lock file always fails with ENOENT.
    getClusterLockFilePath: () => nodePath.default.join(folderPath, 'missing', 'start.lock'),
  };
});

afterEach(async () => {
  await fs.remove(clusterFolderPath);
});

describe('withClusterLock', () => {
  // A failure that is not "the lock already exists" repeats on every attempt and never creates the
  // file the staleness check looks for: retrying it spins forever without reaching the deadline.
  it('should not retry a write failure that is not an existing lock', async () => {
    const removeSpy = vi.spyOn(fs, 'remove');

    await expect(
      withClusterLock(() => {
        return Promise.resolve('acquired');
      }),
    ).rejects.toThrow('ENOENT');
    expect(removeSpy).not.toHaveBeenCalled();

    removeSpy.mockRestore();
  });
});
