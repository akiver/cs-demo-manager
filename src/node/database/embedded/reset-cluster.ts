import fs from 'fs-extra';
import { getClusterDataFolderPath, getClusterFolderPath } from './embedded-postgres-paths';
import { findRunningCluster } from './read-postmaster-pid';
import { stopEmbeddedClusterWithoutLock } from './stop-cluster';
import { EmbeddedPostgresInUse } from './errors/embedded-postgres-in-use';
import { tryAcquireExclusiveClusterUsage, withClusterLock } from './cluster-lock';
import { EmbeddedPostgresIdentityUnverifiable } from './errors/embedded-postgres-identity-unverifiable';

/**
 * Deletes the bundled cluster so that the next start creates a new one.
 *
 * ! It destroys the data it holds. It's the only way out of the states where the cluster can't be
 * opened anymore: a data folder created by another PostgreSQL major version, and a lost state.json,
 * whose password is the only one the cluster accepts and is stored nowhere else.
 */
export async function resetEmbeddedCluster() {
  await withClusterLock(async () => {
    const exclusiveUsage = await tryAcquireExclusiveClusterUsage();
    if (exclusiveUsage === undefined) {
      throw new EmbeddedPostgresInUse();
    }

    try {
      const stopResult = await stopEmbeddedClusterWithoutLock();
      if (stopResult.status === 'identity-unverifiable') {
        throw new EmbeddedPostgresIdentityUnverifiable(stopResult.cause);
      }
      if (stopResult.status === 'failed') {
        throw new Error('The built-in database could not be stopped, so the reset was aborted.', {
          cause: stopResult.cause,
        });
      }

      // Even a successful pg_ctl --wait is verified before the destructive step. Deleting the
      // folder under a running server corrupts it wherever open files can be removed.
      if ((await findRunningCluster(getClusterDataFolderPath())) !== undefined) {
        throw new Error('The built-in database could not be stopped, it has to be stopped before being reset.');
      }

      await fs.remove(getClusterFolderPath());
    } finally {
      await exclusiveUsage.release();
    }
  });
}
