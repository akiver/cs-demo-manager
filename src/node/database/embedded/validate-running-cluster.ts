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
    // ! connectionTimeoutMillis only bounds the connect. A postmaster that accepts a connection and
    // then stops answering would hold this query forever, and it runs while the lifecycle lock is
    // held during shutdown, which is exactly how the detached server ends up orphaned.
    connectionTimeoutMillis: 5_000,
    query_timeout: 5_000,
    statement_timeout: 5_000,
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
