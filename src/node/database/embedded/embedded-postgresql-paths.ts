import path from 'node:path';
import { getStaticFolderPath } from 'csdm/node/filesystem/get-static-folder-path';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';
import { isWindows } from 'csdm/node/os/is-windows';

export type ExecutableName = 'initdb' | 'pg_ctl' | 'postgres';

export function getEmbeddedPostgreSqlBinariesFolderPath() {
  return path.join(getStaticFolderPath(), 'postgres');
}

export function getEmbeddedPostgreSqlExecutablePath(name: ExecutableName) {
  return path.join(getEmbeddedPostgreSqlBinariesFolderPath(), 'bin', isWindows ? `${name}.exe` : name);
}

// Folder holding everything the embedded server writes: the data folder, its password and the log file.
export function getEmbeddedDatabaseFolderPath() {
  return path.join(getAppFolderPath(), 'postgres');
}

export function getEmbeddedDatabaseDataFolderPath() {
  return path.join(getEmbeddedDatabaseFolderPath(), 'data');
}

export function getEmbeddedDatabasePasswordFilePath() {
  return path.join(getEmbeddedDatabaseFolderPath(), 'password');
}

// Output of pg_ctl start and everything the server logs afterwards, it holds the current session only.
export function getEmbeddedDatabaseLogFilePath() {
  return path.join(getEmbeddedDatabaseFolderPath(), 'postgresql.log');
}
