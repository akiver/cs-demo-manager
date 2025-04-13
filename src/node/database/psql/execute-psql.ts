import { exec, type ExecException } from 'node:child_process';
import { PsqlTimeout } from './errors/psql-timeout';

function removeDatabaseInformationFromMessage(message: string) {
  const regex = /postgresql:\/\/(.*?):(.*?)@(.*):(\d+)\/?(.*)/g;

  return message.replace(regex, 'postgresql://*****:*****@*****:****/$5');
}

type Options = {
  timeoutMs: number;
};

export async function executePsql(command: string, options?: Options | undefined) {
  return new Promise<void>((resolve, reject) => {
    exec(
      `psql ${command}`,
      {
        env: { ...process.env, PGCONNECT_TIMEOUT: '10' },
        timeout: options?.timeoutMs ?? 0,
      },
      (error: ExecException | null) => {
        if (error !== null) {
          const isTimeout =
            (error.code === null && error.signal === 'SIGTERM') ||
            (error instanceof Error && error.message.includes('timeout'));

          error.message = removeDatabaseInformationFromMessage(error.message);
          if (isTimeout) {
            return reject(new PsqlTimeout());
          }

          return reject(error);
        }

        resolve();
      },
    );
  });
}
