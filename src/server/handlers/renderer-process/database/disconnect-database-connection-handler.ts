import { destroyDatabaseConnection } from 'csdm/node/database/database';
import { stopBackgroundTasks } from 'csdm/server/start-background-tasks';
import { stopEmbeddedPostgreSqlIfUnused } from 'csdm/server/stop-embedded-postgresql-if-unused';

export async function disconnectDatabaseConnectionHandler() {
  // Each step runs even if the previous one failed, otherwise a pool that fails to close would leave the background
  // tasks scheduled and the embedded database server running after a disconnect (same approach as exitDaemon).
  // The first error is reported once everything has been released.
  let firstError: unknown;

  stopBackgroundTasks();

  try {
    await destroyDatabaseConnection();
  } catch (error) {
    logger.error('Error while closing the database connection');
    logger.error(error);
    firstError = error;
  }

  try {
    await stopEmbeddedPostgreSqlIfUnused();
  } catch (error) {
    logger.error('Error while stopping the embedded database server');
    logger.error(error);
    firstError ??= error;
  }

  if (firstError !== undefined) {
    throw firstError instanceof Error ? firstError.message : 'Unknown error';
  }
}
