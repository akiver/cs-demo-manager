import { userInfo } from 'node:os';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { spawn } from 'node:child_process';

async function getPathVariableValue() {
  return new Promise<string>((resolve, reject) => {
    const { shell } = userInfo();
    if (!shell) {
      return reject(new Error('Could not find shell'));
    }

    const childProcess: ChildProcessWithoutNullStreams = spawn(shell, ['-ilc', 'env; exit'], {
      // @ts-ignore No need to specify all custom NodeJS.ProcessEnv variables.
      env: {
        // Disables Oh My Zsh auto-update, it can block the process
        DISABLE_AUTO_UPDATE: 'true',
      },
    });

    childProcess.stdout.on('data', (buffer: Buffer) => {
      const allLines = buffer.toString().split('\n');
      const pathLine = allLines.find((line) => {
        return line.startsWith('PATH=');
      });
      if (pathLine === undefined) {
        return reject(new Error('Could not find PATH in environment'));
      }
      return resolve(pathLine.split('=')[1]);
    });

    childProcess.on('close', (code) => {
      if (code !== 0) {
        return reject();
      }
    });
  });
}

export async function injectPathVariableIntoProcess() {
  /**
   * On macOS/Linux, starting an app with a GUI from the OS files explorer doesn't inherit the environment variables
   * defined in user's dotfiles.
   * It means that the PATH variable which contains the location of the "psql" binary used to create the database
   * and insert matches from CSV files will be missing.
   * Note: On macOS, using "open MyApp.app" from the command line does inherit environment variables properly.
   *
   * To make sure the PATH variable is correct, we update it by reading the output of the shell command "env".
   */
  if (process.platform !== 'win32') {
    try {
      process.env.PATH = await getPathVariableValue();
    } catch (error) {
      logger.error('Failed to get the PATH environment variable value.');
      logger.error(error);
    }
  }
}
