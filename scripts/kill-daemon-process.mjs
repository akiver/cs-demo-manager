// @ts-check
import path from 'node:path';
import fs from 'fs-extra';
import { resolveAppFolderPath } from '../src/node/filesystem/resolve-app-folder-path.ts';

const daemonInfoFilePath = path.join(resolveAppFolderPath(true), 'daemon.json');

/**
 * The WebSocket server runs as a detached daemon that outlives the process that spawned it, kill it on rebuild so the
 * next Electron or CLI run spawns a daemon running the latest server code (it also releases .node files lock on
 * Windows).
 *
 * @param {(message: string) => void} log
 */
export function killDaemonProcess(log = console.log) {
  try {
    const { pid } = fs.readJsonSync(daemonInfoFilePath);
    process.kill(pid, 'SIGTERM');
    log(`Killed daemon process ${pid}`);
  } catch {
    // There is no daemon info file or the daemon is already dead.
  }

  // On Windows, SIGTERM terminates the daemon without running its signal handler so it never deletes its discovery
  // file: remove it here, otherwise the next rebuild would signal a stale PID that the OS may have recycled to an
  // unrelated process.
  fs.removeSync(daemonInfoFilePath);
}
