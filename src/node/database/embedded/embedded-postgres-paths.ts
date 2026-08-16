import path from 'node:path';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

export function getClusterFolderPath() {
  // @platform win32 The home folder may be redirected to OneDrive (Known Folder Move) and syncing a
  // PostgreSQL data folder corrupts it, so the cluster is stored in the non-synced local app data.
  // ! The variable must hold an absolute path: an empty or relative one would put the cluster
  // somewhere relative to the current working directory, which the app also deletes on a failed
  // initialization.
  const localAppDataFolderPath = process.env.LOCALAPPDATA;
  if (
    process.platform === 'win32' &&
    typeof localAppDataFolderPath === 'string' &&
    path.isAbsolute(localAppDataFolderPath)
  ) {
    return path.join(localAppDataFolderPath, IS_DEV ? 'csdm-dev' : 'csdm', 'postgres');
  }

  return path.join(getAppFolderPath(), 'postgres');
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
  return path.join(getClusterFolderPath(), 'start.lock');
}
