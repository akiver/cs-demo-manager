import path from 'node:path';
import fs from 'fs-extra';

export type PostmasterPid = {
  pid: number;
  dataFolderPath: string;
  port: number;
};

export function isProcessAlive(pid: number) {
  try {
    // Signal 0 doesn't send anything, it only checks that the process exists.
    process.kill(pid, 0);

    return true;
  } catch (error) {
    // The process exists but belongs to another user.
    return error instanceof Error && 'code' in error && error.code === 'EPERM';
  }
}

/**
 * Reads the postmaster.pid file written by a running cluster.
 * Its format is documented in src/include/utils/pidfile.h, the lines we care about are:
 * 1. the postmaster PID
 * 2. the data folder path
 * 4. the port
 */
export async function readPostmasterPid(dataFolderPath: string): Promise<PostmasterPid | undefined> {
  try {
    const content = await fs.readFile(path.join(dataFolderPath, 'postmaster.pid'), 'utf8');
    const lines = content.split('\n');
    if (lines.length < 4) {
      return undefined;
    }

    const pid = Number.parseInt(lines[0], 10);
    const port = Number.parseInt(lines[3], 10);
    if (Number.isNaN(pid) || Number.isNaN(port)) {
      return undefined;
    }

    return {
      pid,
      dataFolderPath: lines[1].trim(),
      port,
    };
  } catch {
    return undefined;
  }
}

// Returns the running cluster of the given data folder, if any.
export async function findRunningCluster(dataFolderPath: string): Promise<PostmasterPid | undefined> {
  const postmasterPid = await readPostmasterPid(dataFolderPath);
  if (postmasterPid === undefined) {
    return undefined;
  }

  if (path.resolve(postmasterPid.dataFolderPath) !== path.resolve(dataFolderPath)) {
    return undefined;
  }

  // A stale postmaster.pid is left behind after a crash, the postmaster removes it itself on start.
  return isProcessAlive(postmasterPid.pid) ? postmasterPid : undefined;
}
