import fs from 'fs-extra';
import { getClusterFolderPath } from './embedded-postgres-paths';
import { stopEmbeddedCluster } from './stop-cluster';

/**
 * Deletes the bundled cluster so that the next start creates a new one.
 *
 * ! It destroys the data it holds. It's the only way out of the states where the cluster can't be
 * opened anymore: a data folder created by another PostgreSQL major version, and a lost state.json,
 * whose password is the only one the cluster accepts and is stored nowhere else.
 */
export async function resetEmbeddedCluster() {
  await stopEmbeddedCluster();
  await fs.remove(getClusterFolderPath());
}
