import { db, destroyDatabaseConnection, discardPreparedDatabaseConnection } from 'csdm/node/database/database';
import { resetDatabase } from 'csdm/node/database/reset-database';
import { analysesListener } from 'csdm/server/analyses-listener';
import { DatabaseTransitionInProgress } from 'csdm/node/database/errors/database-transition-in-progress';
import { buildDatabaseOperationError } from 'csdm/server/database-operation-error';
import { stopBackgroundTasks } from 'csdm/server/start-background-tasks';
import { getSettings } from 'csdm/node/settings/get-settings';
import { connectDatabase } from 'csdm/node/database/connect-database';
import { prepareUnmigratedDatabaseConnection } from 'csdm/node/database/open-database';
import type { PreparedDatabaseConnection } from 'csdm/node/database/database';
import type { DatabaseSettings } from 'csdm/node/settings/settings';

export async function resetDatabaseHandler() {
  const releaseTransition = analysesListener.tryBeginDatabaseTransition();
  if (releaseTransition === undefined) {
    return buildDatabaseOperationError(new DatabaseTransitionInProgress());
  }

  let previousDatabaseSettings: DatabaseSettings | undefined;
  // ! The reset is the recovery offered when the startup migration failed, and in that case no
  // connection was ever published. Without a connection of its own the reset would throw on an
  // undefined `db` and leave the user with no way out of a schema mismatch.
  let temporaryConnection: PreparedDatabaseConnection | undefined;
  try {
    previousDatabaseSettings = (await getSettings()).database;
    await stopBackgroundTasks();

    if (db === undefined) {
      temporaryConnection = await prepareUnmigratedDatabaseConnection();
    }

    const database = temporaryConnection?.database ?? db;
    await database.transaction().execute(async (transaction) => {
      await resetDatabase(transaction);
    });

    if (temporaryConnection === undefined) {
      await destroyDatabaseConnection();
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
    if (temporaryConnection !== undefined) {
      try {
        await discardPreparedDatabaseConnection(temporaryConnection, { stopEmbeddedIfUnused: true });
      } catch (error) {
        logger.error('Failed to discard the temporary connection used to reset the database');
        logger.error(error);
      }
    }
    releaseTransition();
  }
}
