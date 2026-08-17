import fs from 'fs-extra';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { getClusterDataFolderPath, getClusterFolderPath, getClusterLogFilePath } from './embedded-postgres-paths';
import { ensurePostgresBinariesExist } from './postgres-binaries';
import { startPostgresServer } from './start-postgres-server';
import { findRunningCluster } from './read-postmaster-pid';
import { readOrCreateClusterState, writeClusterState } from './cluster-state';
import { isPortInUse, resolveClusterPort } from './resolve-cluster-port';
import {
  assertClusterVersionMatchesBinaries,
  CLUSTER_DATABASE,
  CLUSTER_USERNAME,
  initializeClusterIfNeeded,
  isClusterInitialized,
} from './initialize-cluster';
import { writeClusterConfig } from './write-cluster-config';
import { acquireClusterUsageLease, type EmbeddedClusterUsageLease, withClusterLock } from './cluster-lock';
import { EmbeddedPostgresStartFailed } from './errors/embedded-postgres-start-failed';
import { isExpectedRunningCluster } from './validate-running-cluster';

export type EmbeddedClusterSession = {
  settings: DatabaseSettings;
  usageLease: EmbeddedClusterUsageLease;
};

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

const MAX_START_ATTEMPTS = 3;

/**
 * Starts the bundled PostgreSQL cluster and returns the settings to connect to it.
 * If a cluster is already running on the data folder, it's reused instead of started again: it
 * happens when the CLI runs while the app is open, and when a previous run was killed without
 * stopping the cluster.
 */
export async function startEmbeddedCluster(): Promise<EmbeddedClusterSession> {
  await ensurePostgresBinariesExist();

  const dataFolderPath = getClusterDataFolderPath();
  await fs.ensureDir(getClusterFolderPath());

  return withClusterLock(async () => {
    const usageLease = await acquireClusterUsageLease();

    try {
      const state = await readOrCreateClusterState(await isClusterInitialized(dataFolderPath));

      const runningCluster = await findRunningCluster(dataFolderPath);
      if (runningCluster !== undefined) {
        if (!(await isExpectedRunningCluster(runningCluster, dataFolderPath, state.password))) {
          throw new EmbeddedPostgresStartFailed(
            `The process listening on port ${runningCluster.port} is not the built-in database from ${dataFolderPath}`,
          );
        }

        logger.log(`Reusing the built-in database already running on port ${runningCluster.port}`);

        return {
          settings: buildDatabaseSettings(runningCluster.port, state.password),
          usageLease,
        };
      }

      await assertClusterVersionMatchesBinaries(dataFolderPath);
      await initializeClusterIfNeeded(state.password);

      for (let attempt = 1; attempt <= MAX_START_ATTEMPTS; attempt++) {
        const port = await resolveClusterPort(attempt === 1 ? state.port : undefined);
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

        if (exitCode === 0) {
          await writeClusterState({ ...state, port });
          logger.log(`Built-in database started on port ${port}`);

          return {
            settings: buildDatabaseSettings(port, state.password),
            usageLease,
          };
        }

        // pg_ctl may time out after PostgreSQL has already reached readiness. Never retry with a
        // different configuration while a verified postmaster owns this data directory.
        const startedCluster = await findRunningCluster(dataFolderPath);
        if (startedCluster !== undefined) {
          if (await isExpectedRunningCluster(startedCluster, dataFolderPath, state.password)) {
            await writeClusterState({ ...state, port: startedCluster.port });
            logger.log(`Built-in database started on port ${startedCluster.port}`);

            return {
              settings: buildDatabaseSettings(startedCluster.port, state.password),
              usageLease,
            };
          }

          throw new EmbeddedPostgresStartFailed(
            `Refusing to retry while an unverified process owns ${dataFolderPath}/postmaster.pid`,
          );
        }

        const portWasTaken = await isPortInUse(port);
        if (portWasTaken && attempt < MAX_START_ATTEMPTS) {
          logger.warn(`Port ${port} was occupied before PostgreSQL started, retrying with another port`);
          continue;
        }

        const logTail = await readLogFileTail();
        throw new EmbeddedPostgresStartFailed(
          `Failed to start the built-in database, pg_ctl exited with code ${exitCode}\n${logTail}`,
        );
      }

      throw new EmbeddedPostgresStartFailed('Failed to start the built-in database after three attempts.');
    } catch (error) {
      await usageLease.release();
      throw error;
    }
  });
}
