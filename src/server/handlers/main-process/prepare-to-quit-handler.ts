import { destroyDatabaseConnection } from 'csdm/node/database/database';
import { stopEmbeddedCluster } from 'csdm/node/database/embedded/stop-cluster';
import { stopBackgroundTasks } from 'csdm/server/start-background-tasks';

async function prepareToQuit() {
  try {
    await stopBackgroundTasks();
    await destroyDatabaseConnection({
      stopEmbeddedIfUnused: false,
      releasePendingEmbeddedWithoutStopping: true,
    });
  } catch (error) {
    logger.error('Error while releasing the database connection');
    logger.error(error);
  }

  // The lifecycle lock itself may fail before the inner PostgreSQL stop can handle its errors. The
  // shutdown promise must still settle so the signal safety path can exit the process.
  try {
    await stopEmbeddedCluster();
  } catch (error) {
    logger.error('Failed to stop the built-in database while quitting');
    logger.error(error);
  }
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
