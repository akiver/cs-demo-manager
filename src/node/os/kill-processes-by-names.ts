import { exec } from 'node:child_process';
import { isWindows } from 'csdm/node/os/is-windows';

function killProcess(args: string): Promise<boolean> {
  return new Promise((resolve) => {
    let command: string;
    if (isWindows) {
      command = `taskkill /f ${args}`;
    } else {
      command = `pkill -9 ${args}`;
    }

    return exec(command, { windowsHide: true }, (err, stdout) => {
      if (isWindows) {
        // If we got some output on Windows, it means that the process has been killed.
        return resolve(stdout !== '');
      }

      if (err) {
        return resolve(false);
      }

      return resolve(true);
    });
  });
}

export async function killProcessesByNames(names: string[]): Promise<boolean> {
  if (isWindows) {
    const args = names.map((name) => `/im ${name}`).join(' ');
    return await killProcess(args);
  }

  const haveBeenKilled = await Promise.all(names.map(killProcess));

  return haveBeenKilled.some((hasBeenKilled) => hasBeenKilled);
}
