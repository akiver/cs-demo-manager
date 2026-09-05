import { db, destroyDatabaseConnection } from 'csdm/node/database/database';
import { throwErrorMessage } from 'csdm/server/handlers/throw-error-message';
import { resetDatabase } from 'csdm/node/database/reset-database';
import { analysesListener } from 'csdm/server/analyses-listener';

export async function resetDatabaseHandler() {
  try {
    analysesListener.clear();
    await db.transaction().execute(async (transaction) => {
      await resetDatabase(transaction);
    });
    await destroyDatabaseConnection();
  } catch (error) {
    throwErrorMessage(error, 'Error while resetting database');
  }
}
