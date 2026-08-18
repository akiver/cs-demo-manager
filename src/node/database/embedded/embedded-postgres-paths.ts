import path from 'node:path';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

function resolveClusterFolderPath(
  platform: NodeJS.Platform,
  localAppDataFolderPath: string | undefined,
  appFolderPath: string,
  isDev: boolean,
) {
  // @platform win32 The home folder may be redirected to OneDrive (Known Folder Move) and syncing a
  // PostgreSQL data folder corrupts it, so the cluster is stored in the non-synced local app data.
  // ! The variable must hold an absolute path: an empty or relative one would put the cluster
  // somewhere relative to the current working directory, which the app also deletes on a failed
  // initialization.
  if (
    platform === 'win32' &&
    typeof localAppDataFolderPath === 'string' &&
    path.win32.isAbsolute(localAppDataFolderPath)
  ) {
    return path.win32.join(localAppDataFolderPath, isDev ? 'csdm-dev' : 'csdm', 'postgres');
  }

  return path.join(appFolderPath, 'postgres');
}

export function getClusterFolderPath() {
  const isDev = typeof IS_DEV !== 'undefined' && IS_DEV;
  return resolveClusterFolderPath(process.platform, process.env.LOCALAPPDATA, getAppFolderPath(), isDev);
}

export function getClusterDataFolderPath() {
  return path.join(getClusterFolderPath(), 'pgdata');
}

export function getClusterLogFilePath() {
  return path.join(getClusterFolderPath(), 'pgdata.log');
}

export function getClusterStateFilePath() {
  return path.join(getClusterFolderPath(), 'state.json');
}

export function getClusterLockFilePath() {
  return path.join(path.dirname(getClusterFolderPath()), 'postgres-lifecycle.lock');
}

export function getClusterUsageLockFilePath() {
  return path.join(path.dirname(getClusterFolderPath()), 'postgres-usage.lock');
}
