import { destroyDatabaseConnection, discardPreparedDatabaseConnection } from 'csdm/node/database/database';
import { resetDatabase } from 'csdm/node/database/reset-database';
import { analysesListener } from 'csdm/server/analyses-listener';
import { DatabaseTransitionInProgress } from 'csdm/node/database/errors/database-transition-in-progress';
import { buildDatabaseOperationError } from 'csdm/server/database-operation-error';
import { stopBackgroundTasks } from 'csdm/server/start-background-tasks';
import { getSettings } from 'csdm/node/settings/get-settings';
import { connectDatabase } from 'csdm/node/database/connect-database';
import { prepareUnmigratedDatabaseConnection } from 'csdm/node/database/open-database';
import type { DatabaseSettings } from 'csdm/node/settings/settings';

/**
 * Empties the database and leaves the app disconnected.
 *
 * ! It always resets through a connection of its own rather than the published one. The reset is
 * also the recovery offered when the schema migration failed at startup, where no connection was
 * ever published, and after a disconnect, where the published one is already destroyed.
 */
export async function resetDatabaseHandler() {
  const releaseTransition = analysesListener.tryBeginDatabaseTransition();
  if (releaseTransition === undefined) {
    return buildDatabaseOperationError(new DatabaseTransitionInProgress());
  }

  let previousDatabaseSettings: DatabaseSettings | undefined;
  try {
    previousDatabaseSettings = (await getSettings()).database;
    await stopBackgroundTasks();
    await destroyDatabaseConnection();

    const connection = await prepareUnmigratedDatabaseConnection();
    try {
      await connection.database.transaction().execute(async (transaction) => {
        await resetDatabase(transaction);
      });
    } finally {
      await discardPreparedDatabaseConnection(connection, { stopEmbeddedIfUnused: true });
    }
  } catch (error) {
    logger.error('Error while resetting database');
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
