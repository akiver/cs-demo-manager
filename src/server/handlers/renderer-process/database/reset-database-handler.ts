import { db } from 'csdm/node/database/database';
import { resetDatabase } from 'csdm/node/database/reset-database';
import { analysesListener } from 'csdm/server/analyses-listener';

export async function resetDatabaseHandler() {
  try {
    analysesListener.clear();
    await db.transaction().execute(async (transaction) => {
      await resetDatabase(transaction);
    });
    await db.destroy();
  } catch (error) {
    logger.error('Error while resetting database');
    logger.error(error);
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw errorMessage;
  }
}
