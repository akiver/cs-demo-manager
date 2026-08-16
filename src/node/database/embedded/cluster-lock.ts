import fs from 'fs-extra';
import { getClusterFolderPath, getClusterLockFilePath } from './embedded-postgres-paths';
import { isProcessAlive } from './read-postmaster-pid';
import { EmbeddedPostgresStartFailed } from './errors/embedded-postgres-start-failed';

// ! It has to exceed what the holder may legitimately spend inside the lock: initdb followed by
// "pg_ctl start", which waits up to 60 seconds on its own.
const LOCK_TIMEOUT_MS = 180_000;
const LOCK_RETRY_DELAY_MS = 250;

function wait(delayMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

function isAlreadyExistsError(error: unknown) {
  return error instanceof Error && 'code' in error && error.code === 'EEXIST';
}

async function isLockStale(lockFilePath: string) {
  try {
    const pid = Number.parseInt(await fs.readFile(lockFilePath, 'utf8'), 10);

    return Number.isNaN(pid) || !isProcessAlive(pid);
  } catch {
    return true;
  }
}

/**
 * Removes a lock left behind by a process that died while holding it.
 *
 * ! Renaming first instead of deleting: two processes recovering the same stale lock would both
 * delete it, and the one deleting last would wipe the lock the other just acquired. Only one rename
 * can succeed, so only one of them gets to clean up.
 * A lock acquired between the staleness check and the rename is still deleted, but that requires a
 * third process to acquire it within that window.
 */
async function claimStaleLock(lockFilePath: string) {
  const tombstoneFilePath = `${lockFilePath}.${process.pid}.stale`;
  try {
    await fs.rename(lockFilePath, tombstoneFilePath);
  } catch {
    return;
  }

  await fs.remove(tombstoneFilePath);
}

async function acquireLock(lockFilePath: string) {
  const deadline = Date.now() + LOCK_TIMEOUT_MS;

  while (true) {
    try {
      await fs.writeFile(lockFilePath, String(process.pid), { flag: 'wx' });

      return;
    } catch (error) {
      // ! Only an existing lock is worth retrying. Any other failure (EACCES, EROFS, ENOSPC...)
      // makes every attempt fail the same way, and the file the staleness check looks for is never
      // created: retrying would spin forever without ever reaching the deadline below.
      if (!isAlreadyExistsError(error)) {
        throw error;
      }

      if (await isLockStale(lockFilePath)) {
        await claimStaleLock(lockFilePath);
      }

      if (Date.now() > deadline) {
        throw new EmbeddedPostgresStartFailed(
          `Another CS Demo Manager process is still starting the built-in database, it did not release ${lockFilePath} within ${LOCK_TIMEOUT_MS / 1000} seconds`,
          error,
        );
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
