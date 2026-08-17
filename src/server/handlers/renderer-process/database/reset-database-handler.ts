import { db, destroyDatabaseConnection } from 'csdm/node/database/database';
import { resetDatabase } from 'csdm/node/database/reset-database';
import { analysesListener } from 'csdm/server/analyses-listener';
import { DatabaseTransitionInProgress } from 'csdm/node/database/errors/database-transition-in-progress';
import { buildDatabaseOperationError } from 'csdm/server/database-operation-error';
import { stopBackgroundTasks } from 'csdm/server/start-background-tasks';

export async function resetDatabaseHandler() {
  const releaseTransition = analysesListener.tryBeginDatabaseTransition();
  if (releaseTransition === undefined) {
    return buildDatabaseOperationError(new DatabaseTransitionInProgress());
  }

  try {
    await db.transaction().execute(async (transaction) => {
      await resetDatabase(transaction);
    });
    stopBackgroundTasks();
    await destroyDatabaseConnection();
  } catch (error) {
    logger.error('Error while resetting database');
    logger.error(error);

    return buildDatabaseOperationError(error);
  } finally {
    releaseTransition();
  }
}
