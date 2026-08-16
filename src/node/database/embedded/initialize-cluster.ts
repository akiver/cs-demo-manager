import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'fs-extra';
import { getClusterDataFolderPath } from './embedded-postgres-paths';
import { getBundledPostgresVersion, getPostgresBinaryPath } from './postgres-binaries';
import { runPostgresCommand } from './run-postgres-command';
import { EmbeddedPostgresInitFailed } from './errors/embedded-postgres-init-failed';
import { EmbeddedPostgresVersionMismatch } from './errors/embedded-postgres-version-mismatch';

export const CLUSTER_USERNAME = 'csdm';
export const CLUSTER_DATABASE = 'csdm';

function getVersionFilePath(dataFolderPath: string) {
  return path.join(dataFolderPath, 'PG_VERSION');
}

/**
 * PG_VERSION is written by initdb, it's what tells an initialized data folder apart from an empty
 * or half-initialized one.
 *
 * ! Not fs.pathExists, which answers false for a permission or I/O failure too. Reporting an
 * unreadable cluster as absent is what makes readOrCreateClusterState generate a password and
 * overwrite the only copy of the one the cluster expects.
 */
export async function isClusterInitialized(dataFolderPath: string) {
  try {
    await fs.access(getVersionFilePath(dataFolderPath));

    return true;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

async function readClusterMajorVersion(dataFolderPath: string) {
  try {
    const version = await fs.readFile(getVersionFilePath(dataFolderPath), 'utf8');

    return version.trim();
  } catch (error) {
    // ! Only a missing file means "no cluster yet". Treating the other failures the same way would
    // skip the version check and report a permission or I/O problem as an unrelated startup error.
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return undefined;
    }

    throw error;
  }
}

/**
 * A data folder created by PostgreSQL X can't be opened by PostgreSQL X+1, it requires a data
 * migration. Failing early avoids a confusing "database files are incompatible with server" crash.
 */
export async function assertClusterVersionMatchesBinaries(dataFolderPath: string) {
  const clusterVersion = await readClusterMajorVersion(dataFolderPath);
  if (clusterVersion === undefined) {
    return;
  }

  const binariesVersion = await getBundledPostgresVersion();
  const binariesMajorVersion = binariesVersion.split('.')[0];
  if (clusterVersion !== binariesMajorVersion) {
    throw new EmbeddedPostgresVersionMismatch(clusterVersion, binariesVersion);
  }
}

/**
 * Runs initdb on the first launch.
 *
 * ! It never runs on the data folder itself. A folder this call owns is used instead and moved into
 * place once initdb succeeded, which means the cleanup below can only ever delete what this call
 * created. Running it in the data folder would put two things at risk: a folder holding a cluster
 * whose PG_VERSION was lost, which makes initdb fail and used to be deleted with the demos it holds,
 * and the cluster another process is creating at the same time, since the lock serializing them is
 * a plain file and cannot be made race-free.
 */
export async function initializeClusterIfNeeded(password: string) {
  const dataFolderPath = getClusterDataFolderPath();
  if (await isClusterInitialized(dataFolderPath)) {
    return;
  }

  const stagingFolderPath = `${dataFolderPath}.${process.pid}.init`;
  // ! The password must not be passed through argv, it would be visible in the process list.
  const passwordFilePath = path.join(os.tmpdir(), `csdm-pg-${crypto.randomBytes(8).toString('hex')}`);
  await fs.writeFile(passwordFilePath, password, { mode: 0o600 });

  try {
    await fs.remove(stagingFolderPath);
    await fs.ensureDir(stagingFolderPath);
    await runPostgresCommand(getPostgresBinaryPath('initdb'), [
      '--pgdata',
      stagingFolderPath,
      '--username',
      CLUSTER_USERNAME,
      '--pwfile',
      passwordFilePath,
      '--auth',
      'scram-sha-256',
      '--encoding',
      'UTF8',
      '--locale',
      'C',
    ]);

    // A data folder is relocatable, initdb writes no absolute path into it.
    // ! move() refuses an existing destination, which is what leaves a folder that isn't ours alone.
    await fs.move(stagingFolderPath, dataFolderPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new EmbeddedPostgresInitFailed(
      `Failed to create the built-in database in ${dataFolderPath}: ${message}`,
      error,
    );
  } finally {
    // A half-initialized folder makes every next attempt fail, and it's ours to delete.
    await Promise.all([fs.remove(passwordFilePath), fs.remove(stagingFolderPath)]);
  }
}
