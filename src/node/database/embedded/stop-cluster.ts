import { getClusterDataFolderPath } from './embedded-postgres-paths';
import { getPostgresBinaryPath } from './postgres-binaries';
import { runPostgresCommand } from './run-postgres-command';
import { findRunningCluster } from './read-postmaster-pid';
import { CLUSTER_LIFECYCLE_LOCK_TIMEOUT_MS, tryAcquireExclusiveClusterUsage, withClusterLock } from './cluster-lock';
import type { EmbeddedClusterSession } from './start-cluster';
import { readClusterState } from './cluster-state';
import { isExpectedRunningCluster } from './validate-running-cluster';

const STOP_TIMEOUT_IN_SECONDS = 30;
const STOP_COMMAND_TIMEOUT_MS = (STOP_TIMEOUT_IN_SECONDS + 10) * 1000;
export const EMBEDDED_POSTGRES_SHUTDOWN_TIMEOUT_MS =
  CLUSTER_LIFECYCLE_LOCK_TIMEOUT_MS + STOP_COMMAND_TIMEOUT_MS + 10_000;

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
  if (!options.stopIfUnused) {
    await session.usageLease.release();
    return;
  }

  await withClusterLock(async () => {
    await session.usageLease.release();
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
  });
}

/** Stops the cluster only when no process holds a usage lease. */
export function stopEmbeddedCluster() {
  return withClusterLock(async () => {
    const exclusiveUsage = await tryAcquireExclusiveClusterUsage();
    if (exclusiveUsage === undefined) {
      return false;
    }

    try {
      const result = await stopEmbeddedClusterWithoutLock();

      return result.status === 'not-running' || result.status === 'stopped';
    } finally {
      await exclusiveUsage.release();
    }
  });
}
