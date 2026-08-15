import { destroyDatabaseConnection } from 'csdm/node/database/database';
import { stopBackgroundTasks } from 'csdm/server/start-background-tasks';

export async function disconnectDatabaseConnectionHandler() {
  try {
    await destroyDatabaseConnection();
    stopBackgroundTasks();
  } catch (error) {
    logger.error('Error while disconnection database connection');
    logger.error(error);
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw errorMessage;
  }
}
