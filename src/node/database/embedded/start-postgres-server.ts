import { spawn } from 'node:child_process';
import fs from 'fs-extra';
import { buildPostgresEnv, getPostgresBinaryPath } from './postgres-binaries';

const START_TIMEOUT_IN_SECONDS = 60;

/**
 * Runs "pg_ctl start" and resolves with its exit code.
 *
 * ! It can't go through execFile/exec: pg_ctl leaves the postmaster running detached and the
 * postmaster inherits the stdio pipes. Node waits for those pipes to close before invoking the
 * callback, so the call would never resolve while the server is up.
 * Both processes write to the cluster log file directly, which is also why "pg_ctl -l" is not used.
 *
 * ! Always start through pg_ctl, never by spawning "postgres" directly: on Windows pg_ctl is what
 * creates the restricted token that lets the server run when the app is elevated.
 */
export async function startPostgresServer(dataFolderPath: string, logFilePath: string) {
  // Truncated on each start, otherwise the log grows forever.
  const logFileDescriptor = await fs.open(logFilePath, 'w');

  try {
    return await new Promise<number>((resolve, reject) => {
      const childProcess = spawn(
        getPostgresBinaryPath('pg_ctl'),
        ['--pgdata', dataFolderPath, '--wait', '--timeout', String(START_TIMEOUT_IN_SECONDS), 'start'],
        {
          env: buildPostgresEnv(),
          stdio: ['ignore', logFileDescriptor, logFileDescriptor],
          windowsHide: true,
        },
      );

      childProcess.on('error', reject);
      childProcess.on('close', (code) => {
        resolve(code ?? 1);
      });
    });
  } finally {
    await fs.close(logFileDescriptor);
  }
}
