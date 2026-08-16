import { destroyDatabaseConnection } from 'csdm/node/database/database';
import { stopEmbeddedCluster } from 'csdm/node/database/embedded/stop-cluster';
import { stopBackgroundTasks } from 'csdm/server/start-background-tasks';

async function prepareToQuit() {
  try {
    stopBackgroundTasks();
    await destroyDatabaseConnection();
  } catch (error) {
    logger.error('Error while releasing the database connection');
    logger.error(error);
  }

  // ! Outside the try above: it's the only step releasing something that outlives the process, it
  // has to run even when the previous ones failed. It swallows its own errors.
  await stopEmbeddedCluster();
}

let pendingShutdown: Promise<void> | undefined;

/**
 * Releases the resources that outlive the process before the app quits.
 * It exists because the embedded PostgreSQL cluster is started detached by pg_ctl: killing the
 * server process is not enough to stop it.
 *
 * ! The shutdown is started only once: on POSIX the main process sends a SIGTERM right after the
 * PrepareToQuit reply, and the signal handler goes through here again.
 */
export function prepareToQuitHandler(): Promise<void> {
  pendingShutdown ??= prepareToQuit();

  return pendingShutdown;
}
