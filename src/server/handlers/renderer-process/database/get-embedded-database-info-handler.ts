import { getClusterDataFolderPath, getClusterLogFilePath } from 'csdm/node/database/embedded/embedded-postgres-paths';
import { getBundledPostgresVersion } from 'csdm/node/database/embedded/postgres-binaries';
import { findRunningCluster } from 'csdm/node/database/embedded/read-postmaster-pid';

export type EmbeddedDatabaseInfo = {
  dataFolderPath: string;
  logFilePath: string;
  version: string;
  port: number | undefined;
};

export async function getEmbeddedDatabaseInfoHandler(): Promise<EmbeddedDatabaseInfo> {
  const dataFolderPath = getClusterDataFolderPath();
  const runningCluster = await findRunningCluster(dataFolderPath);

  return {
    dataFolderPath,
    logFilePath: getClusterLogFilePath(),
    version: await getBundledPostgresVersion(),
    port: runningCluster?.port,
  };
}
