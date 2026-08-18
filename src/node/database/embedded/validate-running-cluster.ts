import fs from 'fs-extra';
import { Client } from 'pg';
import type { PostmasterPid } from './read-postmaster-pid';
import { CLUSTER_USERNAME } from './initialize-cluster';
import { arePathsEqual } from './are-paths-equal';

export async function isExpectedRunningCluster(
  runningCluster: PostmasterPid,
  expectedDataFolderPath: string,
  password: string,
) {
  const client = new Client({
    host: '127.0.0.1',
    port: runningCluster.port,
    user: CLUSTER_USERNAME,
    password,
    database: 'postgres',
    connectionTimeoutMillis: 5_000,
  });

  try {
    await client.connect();
    const result = await client.query<{ data_directory: string }>('SHOW data_directory');
    const actualDataFolderPath = result.rows[0]?.data_directory;
    if (actualDataFolderPath === undefined) {
      return false;
    }

    const [actualPath, expectedPath] = await Promise.all([
      fs.realpath(actualDataFolderPath),
      fs.realpath(expectedDataFolderPath),
    ]);

    return arePathsEqual(actualPath, expectedPath);
  } catch (error) {
    logger.error('Failed to verify the identity of the PostgreSQL process from postmaster.pid');
    logger.error(error);
    return false;
  } finally {
    await client.end().catch(() => undefined);
  }
}
