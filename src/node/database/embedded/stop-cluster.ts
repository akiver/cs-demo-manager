import { getClusterDataFolderPath } from './embedded-postgres-paths';
import { getPostgresBinaryPath } from './postgres-binaries';
import { runPostgresCommand } from './run-postgres-command';
import { findRunningCluster } from './read-postmaster-pid';
import { tryAcquireExclusiveClusterUsage, withClusterLock } from './cluster-lock';
import type { EmbeddedClusterSession } from './start-cluster';
import { readClusterState } from './cluster-state';
import { isExpectedRunningCluster } from './validate-running-cluster';

const STOP_TIMEOUT_IN_SECONDS = 30;

/**
 * Stops the bundled cluster if it's running, including one left behind by a previous run that was
 * killed without stopping it, otherwise it would stay up forever.
 *
 * ! Only the app calls it, through the PrepareToQuit handler. The CLI must never stop the cluster:
 * the app may be running and in the middle of a demo analysis. A cluster left running is harmless,
 * the next start reuses it.
 *
 * Errors are logged and swallowed: PostgreSQL is crash-safe, a cluster that couldn't be stopped
 * cleanly recovers from its WAL on the next start.
 */
export async function stopEmbeddedClusterWithoutLock() {
  const dataFolderPath = getClusterDataFolderPath();
  const runningCluster = await findRunningCluster(dataFolderPath);
  if (runningCluster === undefined) {
    return true;
  }

  const state = await readClusterState();
  if (state === undefined || !(await isExpectedRunningCluster(runningCluster, dataFolderPath, state.password))) {
    logger.error('Refusing to stop a PostgreSQL process whose identity could not be verified');
    return false;
  }

  try {
    await runPostgresCommand(
      getPostgresBinaryPath('pg_ctl'),
      ['--pgdata', dataFolderPath, '--mode', 'fast', '--wait', '--timeout', String(STOP_TIMEOUT_IN_SECONDS), 'stop'],
      // Above what pg_ctl waits for on its own: it's the one that has to give up first.
      { timeoutMs: (STOP_TIMEOUT_IN_SECONDS + 10) * 1000 },
    );
    logger.log('Built-in database stopped');
    return true;
  } catch (error) {
    logger.error('Failed to stop the built-in database');
    logger.error(error);
    return false;
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
  await withClusterLock(async () => {
    await session.usageLease.release();
    if (!options.stopIfUnused) {
      return;
    }

    const exclusiveUsage = await tryAcquireExclusiveClusterUsage();
    if (exclusiveUsage === undefined) {
      logger.log('Leaving the built-in database running because another process is using it');
      return;
    }

    try {
      await stopEmbeddedClusterWithoutLock();
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
      return await stopEmbeddedClusterWithoutLock();
    } finally {
      await exclusiveUsage.release();
    }
  });
}
