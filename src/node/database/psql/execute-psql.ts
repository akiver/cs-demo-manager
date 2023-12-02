import { exec } from 'node:child_process';
import { PsqlTimeout } from './errors/psql-timeout';

function removeDatabaseInformationFromMessage(message: string) {
  const regex = /postgresql:\/\/(.*?):(.*?)@(.*):(\d+)\/(.*)/g;

  return message.replace(regex, 'postgresql://*****:*****@*****:****/$5');
}

type Options = {
  timeout: number;
};

export async function executePsql(command: string, options?: Options | undefined) {
  return new Promise<void>((resolve, reject) => {
    exec(`psql ${command}`, { timeout: options?.timeout ?? 0 }, (error) => {
      if (error !== null) {
        error.message = removeDatabaseInformationFromMessage(error.message);
        const isTimeout = error.code === null && error.signal === 'SIGTERM';
        if (isTimeout) {
          return reject(new PsqlTimeout());
        }

        return reject(error);
      }

      resolve();
    });
  });
}
