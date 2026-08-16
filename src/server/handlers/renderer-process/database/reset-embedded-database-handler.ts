import { destroyDatabaseConnection } from 'csdm/node/database/database';
import { resetEmbeddedCluster } from 'csdm/node/database/embedded/reset-cluster';

export async function resetEmbeddedDatabaseHandler() {
  await destroyDatabaseConnection();
  await resetEmbeddedCluster();
}
