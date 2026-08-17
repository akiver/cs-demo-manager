import path from 'node:path';
import fs from 'fs-extra';
import { isPortInUse } from './resolve-cluster-port';
import { arePathsEqual } from './are-paths-equal';

export type PostmasterPid = {
  pid: number;
  dataFolderPath: string;
  port: number;
};

const MAX_PORT = 65_535;

// ! parseInt() accepts anything that starts with a digit, a corrupted file must not produce a PID or
// a port that looks usable.
function parsePositiveInteger(value: string, maximum: number) {
  if (!/^\d+$/.test(value.trim())) {
    return undefined;
  }

  const parsedValue = Number.parseInt(value, 10);

  return parsedValue > 0 && parsedValue <= maximum ? parsedValue : undefined;
}

export function isProcessAlive(pid: number) {
  // ! Signal 0 on a non-positive PID targets a process group, on POSIX the caller's own one, and
  // would report a corrupted file holding "0" as a running cluster.
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

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

    const pid = parsePositiveInteger(lines[0], Number.MAX_SAFE_INTEGER);
    const port = parsePositiveInteger(lines[3], MAX_PORT);
    if (pid === undefined || port === undefined) {
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

  if (!arePathsEqual(postmasterPid.dataFolderPath, dataFolderPath)) {
    return undefined;
  }

  // A stale postmaster.pid is left behind after a crash, the postmaster removes it itself on start.
  if (!isProcessAlive(postmasterPid.pid)) {
    return undefined;
  }

  // ! Being alive is not enough: the operating system reuses PIDs, and an unrelated process holding
  // the PID of a crashed postmaster would make the app reuse a cluster that is not running. It would
  // then fail to connect on every attempt, including the retries, since nothing invalidates the file.
  return (await isPortInUse(postmasterPid.port)) ? postmasterPid : undefined;
}
