import os from 'node:os';
import path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'fs-extra';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { acquireClusterUsageLease, tryAcquireExclusiveClusterUsage, withClusterLock } from './cluster-lock';

const testFolderPath = path.join(os.tmpdir(), 'csdm-cluster-lock-test');
const lifecycleLockFilePath = path.join(testFolderPath, 'lifecycle.lock');
const usageLockFilePath = path.join(testFolderPath, 'usage.lock');

vi.mock('./embedded-postgres-paths', () => {
  return {
    getClusterLockFilePath: () => lifecycleLockFilePath,
    getClusterUsageLockFilePath: () => usageLockFilePath,
  };
});

let childProcess: ChildProcess | undefined;

afterEach(async () => {
  childProcess?.kill();
  childProcess = undefined;
  await fs.remove(testFolderPath);
});

function waitForChildOutput(child: ChildProcess, expectedOutput: string) {
  return new Promise<void>((resolve, reject) => {
    child.once('error', reject);
    child.stdout?.on('data', (data: Buffer) => {
      if (data.toString().includes(expectedOutput)) {
        resolve();
      }
    });
  });
}

describe('embedded PostgreSQL native locks', () => {
  it('should serialize lifecycle operations', async () => {
    let releaseFirstOperation: (() => void) | undefined;
    let markFirstOperationStarted: (() => void) | undefined;
    const firstOperationStarted = new Promise<void>((resolve) => {
      markFirstOperationStarted = resolve;
    });
    const firstOperation = withClusterLock(async () => {
      markFirstOperationStarted?.();
      await new Promise<void>((resolve) => {
        releaseFirstOperation = resolve;
      });
    });
    await firstOperationStarted;

    let secondOperationStarted = false;
    const secondOperation = withClusterLock(() => {
      secondOperationStarted = true;
      return Promise.resolve();
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    expect(secondOperationStarted).toBe(false);

    releaseFirstOperation?.();
    await Promise.all([firstOperation, secondOperation]);
    expect(secondOperationStarted).toBe(true);
  });

  it('should grant exclusive usage only after every shared lease is released', async () => {
    const firstLease = await acquireClusterUsageLease();
    await fs.ensureFile(usageLockFilePath);
    const helperPath = path.join(import.meta.dirname, 'cluster-lock-child.mjs');
    childProcess = spawn(process.execPath, [helperPath, usageLockFilePath, 'shared'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    await waitForChildOutput(childProcess, 'locked');

    expect(await tryAcquireExclusiveClusterUsage()).toBeUndefined();
    await firstLease.release();
    expect(await tryAcquireExclusiveClusterUsage()).toBeUndefined();

    const childExited = new Promise<void>((resolve) => {
      childProcess?.once('exit', () => resolve());
    });
    childProcess.kill();
    await childExited;
    childProcess = undefined;

    const exclusiveLease = await tryAcquireExclusiveClusterUsage();
    expect(exclusiveLease).toBeDefined();
    await exclusiveLease?.release();
  });

  it('should recover the lifecycle lock after its process is killed', async () => {
    await fs.ensureFile(lifecycleLockFilePath);
    const helperPath = path.join(import.meta.dirname, 'cluster-lock-child.mjs');
    childProcess = spawn(process.execPath, [helperPath, lifecycleLockFilePath], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    await waitForChildOutput(childProcess, 'locked');

    let acquired = false;
    const pendingAcquisition = withClusterLock(() => {
      acquired = true;
      return Promise.resolve();
    });
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    expect(acquired).toBe(false);

    childProcess.kill();
    await pendingAcquisition;
    expect(acquired).toBe(true);
  });
});
