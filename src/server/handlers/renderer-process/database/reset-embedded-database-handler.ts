import { destroyDatabaseConnection } from 'csdm/node/database/database';
import { resetEmbeddedCluster } from 'csdm/node/database/embedded/reset-cluster';
import { analysesListener } from 'csdm/server/analyses-listener';
import { DatabaseTransitionInProgress } from 'csdm/node/database/errors/database-transition-in-progress';
import { buildDatabaseOperationError } from 'csdm/server/database-operation-error';
import { getSettings } from 'csdm/node/settings/get-settings';
import { connectDatabase } from 'csdm/node/database/connect-database';
import { stopBackgroundTasks } from 'csdm/server/start-background-tasks';
import type { DatabaseSettings } from 'csdm/node/settings/settings';

export async function resetEmbeddedDatabaseHandler() {
  const releaseTransition = analysesListener.tryBeginDatabaseTransition();
  if (releaseTransition === undefined) {
    return buildDatabaseOperationError(new DatabaseTransitionInProgress());
  }

  let previousDatabaseSettings: DatabaseSettings | undefined;
  try {
    previousDatabaseSettings = (await getSettings()).database;
    await stopBackgroundTasks();
    await destroyDatabaseConnection({ stopEmbeddedIfUnused: true });
    await resetEmbeddedCluster();
  } catch (error) {
    logger.error('Error while resetting the built-in database');
    logger.error(error);

    if (previousDatabaseSettings !== undefined) {
      try {
        await connectDatabase(previousDatabaseSettings);
      } catch (reconnectionError) {
        logger.error('Failed to restore the database connection after a reset failure');
        logger.error(reconnectionError);
      }
    }

    return buildDatabaseOperationError(error);
  } finally {
    releaseTransition();
  }
}
