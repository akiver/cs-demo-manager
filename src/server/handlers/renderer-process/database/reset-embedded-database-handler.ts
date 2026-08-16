import { destroyDatabaseConnection } from 'csdm/node/database/database';
import { resetEmbeddedCluster } from 'csdm/node/database/embedded/reset-cluster';
import { analysesListener } from 'csdm/server/analyses-listener';

export async function resetEmbeddedDatabaseHandler() {
  try {
    // ! Before the connection is closed: an analysis still running would insert its result into the
    // new cluster, which is supposed to be empty.
    analysesListener.clear();
    await destroyDatabaseConnection();
    await resetEmbeddedCluster();
  } catch (error) {
    logger.error('Error while resetting the built-in database');
    logger.error(error);

    throw error instanceof Error ? error.message : 'Unknown error';
  }
}
