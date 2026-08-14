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

async function readClusterMajorVersion(dataFolderPath: string) {
  try {
    const version = await fs.readFile(path.join(dataFolderPath, 'PG_VERSION'), 'utf8');

    return version.trim();
  } catch {
    return undefined;
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

export async function initializeClusterIfNeeded(password: string) {
  const dataFolderPath = getClusterDataFolderPath();
  if (await fs.pathExists(path.join(dataFolderPath, 'PG_VERSION'))) {
    return;
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
    await fs.remove(dataFolderPath);
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new EmbeddedPostgresInitFailed(`Failed to create the built-in database: ${message}`, error);
  } finally {
    await fs.remove(passwordFilePath);
  }
}
