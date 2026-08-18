import { getClusterDataFolderPath } from './embedded-postgres-paths';
import { getPostgresBinaryPath } from './postgres-binaries';
import { runPostgresCommand } from './run-postgres-command';
import { findRunningCluster } from './read-postmaster-pid';
import { CLUSTER_SHUTDOWN_LOCK_TIMEOUT_MS, tryAcquireExclusiveClusterUsage, withClusterLock } from './cluster-lock';
import type { EmbeddedClusterSession } from './start-cluster';
import { readClusterState } from './cluster-state';
import { isExpectedRunningCluster } from './validate-running-cluster';
import { BACKGROUND_TASK_SHUTDOWN_GRACE_MS, SHUTDOWN_MARGIN_MS } from 'csdm/common/shutdown-timeouts';

const STOP_TIMEOUT_IN_SECONDS = 30;
const STOP_COMMAND_TIMEOUT_MS = (STOP_TIMEOUT_IN_SECONDS + 10) * 1000;
/**
 * How long the main process must wait for the server to release the cluster before killing it. It
 * is the sum of every bounded step of the quit sequence: killing the server earlier would leave the
 * detached postmaster behind, which is exactly what this shutdown exists to prevent.
 */
export const EMBEDDED_POSTGRES_SHUTDOWN_TIMEOUT_MS =
  BACKGROUND_TASK_SHUTDOWN_GRACE_MS + CLUSTER_SHUTDOWN_LOCK_TIMEOUT_MS + STOP_COMMAND_TIMEOUT_MS + SHUTDOWN_MARGIN_MS;

export type StopEmbeddedClusterResult =
  | { status: 'not-running' | 'stopped' }
  | { status: 'identity-unverifiable' | 'failed'; cause?: unknown };

/**
 * Stops the bundled cluster if it's running, including one left behind by a previous run that was
 * killed without stopping it, otherwise it would stay up forever.
 *
 * ! Only the app calls it, through the PrepareToQuit handler. The CLI must never stop the cluster:
 * the app may be running and in the middle of a demo analysis. A cluster left running is harmless,
 * the next start reuses it.
 *
 * Errors are returned as explicit statuses: PostgreSQL is crash-safe, but reset callers must never
 * mistake a failed stop for permission to delete the data folder.
 */
export async function stopEmbeddedClusterWithoutLock(
  options: { validationPassword?: string } = {},
): Promise<StopEmbeddedClusterResult> {
  const dataFolderPath = getClusterDataFolderPath();
  const runningCluster = await findRunningCluster(dataFolderPath);
  if (runningCluster === undefined) {
    return { status: 'not-running' };
  }

  let validationPassword = options.validationPassword;
  if (validationPassword === undefined) {
    try {
      validationPassword = (await readClusterState())?.password;
    } catch (error) {
      logger.error('Failed to read the credentials required to verify the built-in database');
      logger.error(error);
      return { status: 'identity-unverifiable', cause: error };
    }
  }

  if (
    validationPassword === undefined ||
    !(await isExpectedRunningCluster(runningCluster, dataFolderPath, validationPassword))
  ) {
    logger.error('Refusing to stop a PostgreSQL process whose identity could not be verified');
    return { status: 'identity-unverifiable' };
  }

  try {
    await runPostgresCommand(
      getPostgresBinaryPath('pg_ctl'),
      ['--pgdata', dataFolderPath, '--mode', 'fast', '--wait', '--timeout', String(STOP_TIMEOUT_IN_SECONDS), 'stop'],
      // Above what pg_ctl waits for on its own: it's the one that has to give up first.
      { timeoutMs: STOP_COMMAND_TIMEOUT_MS },
    );
    logger.log('Built-in database stopped');
    return { status: 'stopped' };
  } catch (error) {
    logger.error('Failed to stop the built-in database');
    logger.error(error);
    return { status: 'failed', cause: error };
  }
}

/**
 * Releases this process' usage lease. The app may also stop the server, but only when no CLI or
 * other app process still holds a shared lease.
 */
export async function releaseEmbeddedClusterSession(
  session: EmbeddedClusterSession,
  options: { stopIfUnused: boolean },
) {
  // ! Released before the lock is taken, never inside it. A lock acquisition that times out would
  // otherwise skip the release and leave this process holding a lease it can never give back, which
  // makes every later reset fail with "the built-in database is in use".
  await session.usageLease.release();

  if (!options.stopIfUnused) {
    return;
  }

  await withClusterLock(async () => {
    const exclusiveUsage = await tryAcquireExclusiveClusterUsage();
    if (exclusiveUsage === undefined) {
      logger.log('Leaving the built-in database running because another process is using it');
      return;
    }

    try {
      await stopEmbeddedClusterWithoutLock({ validationPassword: session.settings.password });
    } finally {
      await exclusiveUsage.release();
    }
  }, CLUSTER_SHUTDOWN_LOCK_TIMEOUT_MS);
}

/** Stops the cluster only when no process holds a usage lease. */
export function stopEmbeddedCluster(options: { validationPassword?: string } = {}) {
  return withClusterLock(async () => {
    const exclusiveUsage = await tryAcquireExclusiveClusterUsage();
    if (exclusiveUsage === undefined) {
      return false;
    }

    try {
      const result = await stopEmbeddedClusterWithoutLock(options);

      return result.status === 'not-running' || result.status === 'stopped';
    } finally {
      await exclusiveUsage.release();
    }
  }, CLUSTER_SHUTDOWN_LOCK_TIMEOUT_MS);
}
