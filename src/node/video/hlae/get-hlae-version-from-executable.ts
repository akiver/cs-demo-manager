import { exec } from 'node:child_process';
import { InvalidHlaeExecutable } from '../errors/invalid-hlae-executable';

function isValidExecutablePath(executablePath: string) {
  return executablePath.toLocaleLowerCase().endsWith('hlae.exe');
}

function sanitizeExecutablePath(executablePath: string) {
  // To use wmic, it's important to have double backslashes ("C:\\path" not "C:\path")
  return executablePath.replaceAll('\\', '\\\\');
}

export async function getHlaeVersionFromExecutable(executablePath: string): Promise<string | undefined> {
  if (!isValidExecutablePath(executablePath)) {
    throw new InvalidHlaeExecutable();
  }

  return new Promise((resolve, reject) => {
    const sanitizedExecutablePath = sanitizeExecutablePath(executablePath);

    // TODO wmic is deprecated https://learn.microsoft.com/en-us/windows/win32/wmisdk/wmic
    // But since it's really slow when using the alternative PowerShell, we will keep using wmic for now.
    // We should re-migrate to PowerShell only when wmic is removed (see commit ea0486205c38e50856abc12ccfee457525f8c2c2)
    exec(
      `wmic datafile where 'name="${sanitizedExecutablePath}"' get version`,
      { windowsHide: true },
      (error, stdout) => {
        if (error) {
          logger.error('Error while getting HLAE version from executable');
          logger.error(error);
          return reject(new InvalidHlaeExecutable());
        }

        const lines = stdout.trim().split('\n');
        if (lines.length !== 2 || !lines[0].startsWith('Version')) {
          return reject(new InvalidHlaeExecutable());
        }

        return resolve(lines[1]);
      },
    );
  });
}
