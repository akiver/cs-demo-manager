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

// PG_VERSION is written by initdb, it's what tells an initialized data folder apart from an empty
// or half-initialized one.
export function isClusterInitialized(dataFolderPath: string) {
  return fs.pathExists(getVersionFilePath(dataFolderPath));
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

async function isFolderEmpty(folderPath: string) {
  try {
    const entries = await fs.readdir(folderPath);

    return entries.length === 0;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return true;
    }

    throw error;
  }
}

export async function initializeClusterIfNeeded(password: string) {
  const dataFolderPath = getClusterDataFolderPath();
  if (await isClusterInitialized(dataFolderPath)) {
    return;
  }

  // ! initdb refuses to run on a folder that is not empty, and the failure path below deletes the
  // folder. Content without PG_VERSION is not necessarily ours: it may be a cluster whose
  // PG_VERSION has been lost, and deleting it would destroy the demos it holds.
  if (!(await isFolderEmpty(dataFolderPath))) {
    throw new EmbeddedPostgresInitFailed(
      `The built-in database folder exists but is not a valid PostgreSQL data folder, it has to be inspected before being reused or deleted: ${dataFolderPath}`,
    );
  }

  // ! The password must not be passed through argv, it would be visible in the process list.
  const passwordFilePath = path.join(os.tmpdir(), `csdm-pg-${crypto.randomBytes(8).toString('hex')}`);
  await fs.writeFile(passwordFilePath, password, { mode: 0o600 });

  try {
    await fs.ensureDir(dataFolderPath);
    await runPostgresCommand(getPostgresBinaryPath('initdb'), [
      '--pgdata',
      dataFolderPath,
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
  } catch (error) {
    // A half-initialized data folder makes every next start fail, start over on the next attempt.
    // Safe to delete: the folder was empty above, everything in it has been written by this initdb.
    await fs.remove(dataFolderPath);
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new EmbeddedPostgresInitFailed(`Failed to create the built-in database: ${message}`, error);
  } finally {
    await fs.remove(passwordFilePath);
  }
}
