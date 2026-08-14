import fs from 'fs-extra';
import { getClusterFolderPath, getClusterLockFilePath } from './embedded-postgres-paths';
import { isProcessAlive } from './read-postmaster-pid';

const LOCK_TIMEOUT_MS = 30_000;
const LOCK_RETRY_DELAY_MS = 250;

function wait(delayMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

async function isLockStale(lockFilePath: string) {
  try {
    const pid = Number.parseInt(await fs.readFile(lockFilePath, 'utf8'), 10);

    return Number.isNaN(pid) || !isProcessAlive(pid);
  } catch {
    return true;
  }
}

async function acquireLock(lockFilePath: string) {
  const deadline = Date.now() + LOCK_TIMEOUT_MS;

  while (true) {
    try {
      await fs.writeFile(lockFilePath, String(process.pid), { flag: 'wx' });

      return;
    } catch (error) {
      if (await isLockStale(lockFilePath)) {
        await fs.remove(lockFilePath);
        continue;
      }

      if (Date.now() > deadline) {
        throw error;
      }

      await wait(LOCK_RETRY_DELAY_MS);
    }
  }
}

/**
 * Serializes the initdb + start sequence, which the app and the CLI can run concurrently on the same
 * data folder. It doesn't protect the cluster usage, only its creation and startup.
 */
export async function withClusterLock<T>(fn: () => Promise<T>): Promise<T> {
  const lockFilePath = getClusterLockFilePath();
  await fs.ensureDir(getClusterFolderPath());
  await acquireLock(lockFilePath);

  try {
    return await fn();
  } finally {
    await fs.remove(lockFilePath);
  }
}
