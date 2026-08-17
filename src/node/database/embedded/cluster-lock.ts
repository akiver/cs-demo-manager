import fs from 'fs-extra';
import { tryLock, unlock } from 'fs-native-extensions';
import { getClusterLockFilePath, getClusterUsageLockFilePath } from './embedded-postgres-paths';
import { EmbeddedPostgresStartFailed } from './errors/embedded-postgres-start-failed';

const LOCK_TIMEOUT_MS = 180_000;
const LOCK_RETRY_DELAY_MS = 250;

function wait(delayMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

type NativeLock = {
  release: () => Promise<void>;
};

async function openLockFile(filePath: string) {
  await fs.ensureFile(filePath);

  return fs.open(filePath, 'r+');
}

function createLock(fileDescriptor: number): NativeLock {
  let isReleased = false;

  return {
    release: async () => {
      if (isReleased) {
        return;
      }

      isReleased = true;
      try {
        unlock(fileDescriptor);
      } finally {
        await fs.close(fileDescriptor);
      }
    },
  };
}

async function acquireLock(filePath: string, shared: boolean, timeoutMs: number): Promise<NativeLock> {
  const fileDescriptor = await openLockFile(filePath);
  const deadline = Date.now() + timeoutMs;

  try {
    while (!tryLock(fileDescriptor, { shared })) {
      if (Date.now() > deadline) {
        throw new EmbeddedPostgresStartFailed(
          `Another CS Demo Manager process did not release ${filePath} within ${timeoutMs / 1000} seconds`,
        );
      }

      await wait(LOCK_RETRY_DELAY_MS);
    }
  } catch (error) {
    await fs.close(fileDescriptor);
    throw error;
  }

  return createLock(fileDescriptor);
}

async function tryAcquireLock(filePath: string, shared: boolean): Promise<NativeLock | undefined> {
  const fileDescriptor = await openLockFile(filePath);

  try {
    if (!tryLock(fileDescriptor, { shared })) {
      await fs.close(fileDescriptor);

      return undefined;
    }
  } catch (error) {
    await fs.close(fileDescriptor);
    throw error;
  }

  return createLock(fileDescriptor);
}

export type EmbeddedClusterUsageLease = NativeLock;

/**
 * Serializes the initdb + start sequence, which the app and the CLI can run concurrently on the same
 * data folder. It doesn't protect the cluster usage, only its creation and startup.
 */
export async function withClusterLock<T>(fn: () => Promise<T>): Promise<T> {
  const lock = await acquireLock(getClusterLockFilePath(), false, LOCK_TIMEOUT_MS);

  try {
    return await fn();
  } finally {
    await lock.release();
  }
}

/** Must be acquired while the lifecycle lock is held, before a reset or stop can begin. */
export function acquireClusterUsageLease() {
  return acquireLock(getClusterUsageLockFilePath(), true, LOCK_TIMEOUT_MS);
}

/** Must be called while the lifecycle lock is held. It never waits for another app/CLI user. */
export function tryAcquireExclusiveClusterUsage() {
  return tryAcquireLock(getClusterUsageLockFilePath(), false);
}
