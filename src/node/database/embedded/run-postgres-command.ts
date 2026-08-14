import { execFile } from 'node:child_process';
import { buildPostgresEnv } from './postgres-binaries';

type Options = {
  timeoutMs?: number;
};

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
  return new Promise((resolve, reject) => {
    execFile(
      binaryPath,
      args,
      {
        env: buildPostgresEnv(),
        timeout: options?.timeoutMs ?? 0,
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        if (error !== null) {
          error.message = `${error.message}\n${stderr}`;

          return reject(error);
        }

        resolve({ stdout, stderr });
      },
    );
  });
}
