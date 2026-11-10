// @ts-check
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import fs from 'fs-extra';
import { resolveAppFolderPath } from '../src/node/filesystem/resolve-app-folder-path.mts';
import {
  embeddedPostgreSqlFolderPath,
  installEmbeddedPostgreSql,
  isEmbeddedPostgreSqlInstalled,
} from './install-deps.mjs';
import { killDaemonProcess } from './kill-daemon-process.mjs';

/**
 * Stops the embedded database server of the dev app if it's running, with the binaries that started it.
 * Their files are locked on Windows while the server runs, they couldn't be replaced.
 *
 * @param {(message: string) => void} log
 */
function stopEmbeddedDatabaseServer(log) {
  const pgCtlPath = path.join(
    embeddedPostgreSqlFolderPath,
    'bin',
    process.platform === 'win32' ? 'pg_ctl.exe' : 'pg_ctl',
  );
  const dataFolderPath = path.join(resolveAppFolderPath(true), 'postgres', 'data');
  if (!fs.pathExistsSync(pgCtlPath) || !fs.pathExistsSync(dataFolderPath)) {
    return;
  }

  /** @param {string[]} args */
  const runPgCtl = (args) => {
    return spawnSync(pgCtlPath, ['-D', dataFolderPath, ...args], { stdio: 'ignore', windowsHide: true });
  };

  // Exit code 0 means that the server is running.
  if (runPgCtl(['status']).status !== 0) {
    return;
  }

  log('Stopping the embedded database server');
  // A failure is not checked here: the installation fails if the server still holds its binaries.
  runPgCtl(['stop', '-m', 'fast', '-w', '-t', '30']);
}

/**
 * Installs the PostgreSQL binaries in static/postgres when they are missing or when their version is not the one the
 * app expects anymore.
 *
 * @param {(message: string) => void} log
 */
export async function ensureEmbeddedPostgreSqlInstalled(log = console.log) {
  if (await isEmbeddedPostgreSqlInstalled()) {
    return;
  }

  log('The embedded PostgreSQL binaries are missing or outdated, installing them');
  // The daemon owns the database server and would restart it, it has to go first.
  killDaemonProcess(log);
  stopEmbeddedDatabaseServer(log);
  try {
    await installEmbeddedPostgreSql();
  } catch (error) {
    throw new Error(
      `Failed to install the embedded PostgreSQL binaries in ${embeddedPostgreSqlFolderPath}, make sure no dev app, CLI or PostgreSQL server started from this folder is running`,
      { cause: error },
    );
  }
  log('Embedded PostgreSQL binaries installed');
}
