import fs from 'fs-extra';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { getClusterDataFolderPath, getClusterFolderPath, getClusterLogFilePath } from './embedded-postgres-paths';
import { ensurePostgresBinariesExist } from './postgres-binaries';
import { startPostgresServer } from './start-postgres-server';
import { findRunningCluster } from './read-postmaster-pid';
import { readOrCreateClusterState, writeClusterState } from './cluster-state';
import { resolveClusterPort } from './resolve-cluster-port';
import {
  assertClusterVersionMatchesBinaries,
  CLUSTER_DATABASE,
  CLUSTER_USERNAME,
  initializeClusterIfNeeded,
  isClusterInitialized,
} from './initialize-cluster';
import { writeClusterConfig } from './write-cluster-config';
import { withClusterLock } from './cluster-lock';
import { EmbeddedPostgresStartFailed } from './errors/embedded-postgres-start-failed';

// The cluster log is the only place where PostgreSQL explains why it refused to start.
async function readLogFileTail() {
  try {
    const content = await fs.readFile(getClusterLogFilePath(), 'utf8');

    return content.split('\n').slice(-50).join('\n').trim();
  } catch {
    return '';
  }
}

function buildDatabaseSettings(port: number, password: string): DatabaseSettings {
  return {
    mode: 'embedded',
    hostname: '127.0.0.1',
    port,
    username: CLUSTER_USERNAME,
    password,
    database: CLUSTER_DATABASE,
  };
}

/**
 * Starts the bundled PostgreSQL cluster and returns the settings to connect to it.
 * If a cluster is already running on the data folder, it's reused instead of started again: it
 * happens when the CLI runs while the app is open, and when a previous run was killed without
 * stopping the cluster.
 */
export async function startEmbeddedCluster(): Promise<DatabaseSettings> {
  await ensurePostgresBinariesExist();

  const dataFolderPath = getClusterDataFolderPath();
  await fs.ensureDir(getClusterFolderPath());

  return withClusterLock(async () => {
    const state = await readOrCreateClusterState(await isClusterInitialized(dataFolderPath));

    const runningCluster = await findRunningCluster(dataFolderPath);
    if (runningCluster !== undefined) {
      logger.log(`Reusing the built-in database already running on port ${runningCluster.port}`);

      return buildDatabaseSettings(runningCluster.port, state.password);
    }

    await assertClusterVersionMatchesBinaries(dataFolderPath);
    await initializeClusterIfNeeded(state.password);

    const port = await resolveClusterPort(state.port);
    await writeClusterConfig(port);

    let exitCode: number;
    try {
      exitCode = await startPostgresServer(dataFolderPath, getClusterLogFilePath());
    } catch (error) {
      // pg_ctl could not be run at all: a missing execute bit or an antivirus holding the binary.
      // Wrapping it here is what gives the UI an actionable message instead of a raw spawn error.
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new EmbeddedPostgresStartFailed(`Failed to run pg_ctl: ${message}\n${await readLogFileTail()}`, error);
    }

    if (exitCode !== 0) {
      const logTail = await readLogFileTail();
      throw new EmbeddedPostgresStartFailed(
        `Failed to start the built-in database, pg_ctl exited with code ${exitCode}\n${logTail}`,
      );
    }

    await writeClusterState({ ...state, port });
    logger.log(`Built-in database started on port ${port}`);

    return buildDatabaseSettings(port, state.password);
  });
}
