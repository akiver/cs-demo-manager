import { execFile } from 'node:child_process';
import { buildPostgresEnv } from './postgres-binaries';

type Options = {
  timeoutMs?: number;
};

// ! Never 0: it would let a hung binary block its caller forever, and the callers are the app
// startup and the quit sequence.
const DEFAULT_TIMEOUT_MS = 120_000;

export type PostgresCommandResult = {
  stdout: string;
  stderr: string;
};

/**
 * ! Always use execFile with an arguments array, never exec with a command string: binary paths
 * contain spaces on every platform ("C:\Program Files\...", "CS Demo Manager.app").
 */
export function runPostgresCommand(
  binaryPath: string,
  args: string[],
  options?: Options,
): Promise<PostgresCommandResult> {
  if (options?.timeoutMs !== undefined && options.timeoutMs <= 0) {
    return Promise.reject(new RangeError('PostgreSQL command timeout must be greater than zero'));
  }

  return new Promise((resolve, reject) => {
    execFile(
      binaryPath,
      args,
      {
        env: buildPostgresEnv(),
        timeout: options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        if (error !== null) {
          const stderrMessage = stderr.trim();
          const message = stderrMessage === '' ? error.message : `${error.message}\n${stderrMessage}`;

          return reject(new Error(message, { cause: error }));
        }

        resolve({ stdout, stderr });
      },
    );
  });
}
