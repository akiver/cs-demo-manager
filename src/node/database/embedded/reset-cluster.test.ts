import os from 'node:os';
import path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'fs-extra';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { acquireClusterUsageLease } from './cluster-lock';
import { resetEmbeddedCluster } from './reset-cluster';
import { waitForChildOutput } from './child-process-test-helpers';

const { findRunningClusterMock, stopClusterMock } = vi.hoisted(() => {
  return {
    findRunningClusterMock: vi.fn(),
    stopClusterMock: vi.fn(),
  };
});

const rootFolderPath = path.join(os.tmpdir(), 'csdm-reset-cluster-test');
const clusterFolderPath = path.join(rootFolderPath, 'postgres');
let childProcess: ChildProcess | undefined;

vi.mock('./embedded-postgres-paths', () => {
  return {
    getClusterFolderPath: () => clusterFolderPath,
    getClusterDataFolderPath: () => path.join(clusterFolderPath, 'pgdata'),
    getClusterLockFilePath: () => path.join(rootFolderPath, 'lifecycle.lock'),
    getClusterUsageLockFilePath: () => path.join(rootFolderPath, 'usage.lock'),
  };
});
vi.mock('./stop-cluster', () => {
  return { stopEmbeddedClusterWithoutLock: stopClusterMock };
});
vi.mock('./read-postmaster-pid', () => {
  return { findRunningCluster: findRunningClusterMock };
});

afterEach(async () => {
  childProcess?.kill();
  childProcess = undefined;
  stopClusterMock.mockReset();
  findRunningClusterMock.mockReset();
  await fs.remove(rootFolderPath);
});

describe('resetEmbeddedCluster', () => {
  it('should refuse to stop or delete the cluster while another process lease is active', async () => {
    await fs.outputFile(path.join(clusterFolderPath, 'sentinel'), 'data');
    const usageLease = await acquireClusterUsageLease();

    await expect(resetEmbeddedCluster()).rejects.toThrow('currently used');
    await expect(fs.pathExists(path.join(clusterFolderPath, 'sentinel'))).resolves.toBe(true);
    expect(stopClusterMock).not.toHaveBeenCalled();

    await usageLease.release();
  });

  it('should keep lifecycle exclusivity until the stopped cluster is deleted', async () => {
    await fs.outputFile(path.join(clusterFolderPath, 'sentinel'), 'data');
    stopClusterMock.mockResolvedValue({ status: 'stopped' });
    findRunningClusterMock.mockResolvedValue(undefined);

    await resetEmbeddedCluster();

    await expect(fs.pathExists(clusterFolderPath)).resolves.toBe(false);
    expect(stopClusterMock).toHaveBeenCalledOnce();
  });

  it('should wait for a lifecycle operation in another process before resetting', async () => {
    const lifecycleLockFilePath = path.join(rootFolderPath, 'lifecycle.lock');
    await fs.outputFile(path.join(clusterFolderPath, 'sentinel'), 'data');
    await fs.ensureFile(lifecycleLockFilePath);
    const helperPath = path.join(import.meta.dirname, 'cluster-lock-child.mjs');
    childProcess = spawn(process.execPath, [helperPath, lifecycleLockFilePath], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    await waitForChildOutput(childProcess, 'locked');

    stopClusterMock.mockResolvedValue({ status: 'not-running' });

    const pendingReset = resetEmbeddedCluster();
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    expect(stopClusterMock).not.toHaveBeenCalled();

    const childExited = new Promise<void>((resolve) => {
      childProcess?.once('exit', () => resolve());
    });
    childProcess.kill();
    await childExited;
    childProcess = undefined;
    await pendingReset;

    expect(stopClusterMock).toHaveBeenCalledOnce();
    await expect(fs.pathExists(clusterFolderPath)).resolves.toBe(false);
  });

  it('should preserve the cluster when pg_ctl failed even if no listener remains', async () => {
    await fs.outputFile(path.join(clusterFolderPath, 'sentinel'), 'data');
    stopClusterMock.mockResolvedValue({ status: 'failed', cause: new Error('timeout') });
    findRunningClusterMock.mockResolvedValue(undefined);

    await expect(resetEmbeddedCluster()).rejects.toThrow('reset was aborted');
    await expect(fs.pathExists(path.join(clusterFolderPath, 'sentinel'))).resolves.toBe(true);
  });

  it('should preserve the cluster when its identity cannot be verified', async () => {
    await fs.outputFile(path.join(clusterFolderPath, 'sentinel'), 'data');
    stopClusterMock.mockResolvedValue({ status: 'identity-unverifiable' });

    await expect(resetEmbeddedCluster()).rejects.toThrow('identity cannot be verified');
    await expect(fs.pathExists(path.join(clusterFolderPath, 'sentinel'))).resolves.toBe(true);
  });
});
