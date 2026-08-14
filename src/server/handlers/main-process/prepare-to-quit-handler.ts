import { destroyDatabaseConnection } from 'csdm/node/database/database';
import { stopEmbeddedCluster } from 'csdm/node/database/embedded/stop-cluster';
import { stopBackgroundTasks } from 'csdm/server/start-background-tasks';

/**
 * Releases the resources that outlive the process before the app quits.
 * It exists because the embedded PostgreSQL cluster is started detached by pg_ctl: killing the
 * server process is not enough to stop it.
 */
export async function prepareToQuitHandler() {
  try {
    stopBackgroundTasks();
    await destroyDatabaseConnection();
    await stopEmbeddedCluster();
  } catch (error) {
    logger.error('Error while preparing to quit');
    logger.error(error);
  }
}
