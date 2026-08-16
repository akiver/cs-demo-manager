import { getClusterDataFolderPath } from './embedded-postgres-paths';
import { getPostgresBinaryPath } from './postgres-binaries';
import { runPostgresCommand } from './run-postgres-command';
import { findRunningCluster } from './read-postmaster-pid';

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
export async function stopEmbeddedCluster() {
  const dataFolderPath = getClusterDataFolderPath();
  if ((await findRunningCluster(dataFolderPath)) === undefined) {
    return;
  }

  try {
    await runPostgresCommand(
      getPostgresBinaryPath('pg_ctl'),
      ['--pgdata', dataFolderPath, '--mode', 'fast', '--wait', '--timeout', String(STOP_TIMEOUT_IN_SECONDS), 'stop'],
      // Above what pg_ctl waits for on its own: it's the one that has to give up first.
      { timeoutMs: (STOP_TIMEOUT_IN_SECONDS + 10) * 1000 },
    );
    logger.log('Built-in database stopped');
  } catch (error) {
    logger.error('Failed to stop the built-in database');
    logger.error(error);
  }
}
