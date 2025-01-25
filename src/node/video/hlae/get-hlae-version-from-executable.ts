import { exec } from 'node:child_process';
import { InvalidHlaeExecutable } from '../errors/invalid-hlae-executable';

function isValidExecutablePath(executablePath: string) {
  return executablePath.toLocaleLowerCase().endsWith('hlae.exe');
}

function sanitizeExecutablePath(executablePath: string) {
  // To use PowerShell, it's important to have double backslashes ("C:\\path" not "C:\path")
  return executablePath.replaceAll('\\', '\\\\');
}

export async function getHlaeVersionFromExecutable(executablePath: string): Promise<string | undefined> {
  if (!isValidExecutablePath(executablePath)) {
    throw new InvalidHlaeExecutable();
  }

  return new Promise((resolve, reject) => {
    const sanitizedExecutablePath = sanitizeExecutablePath(executablePath);

    exec(
      `powershell -Command "(Get-Item '${sanitizedExecutablePath}').VersionInfo.FileVersion"`,
      { windowsHide: true },
      (error, stdout) => {
        if (error) {
          logger.error('Error while getting HLAE version from executable');
          logger.error(error);
          return reject(new InvalidHlaeExecutable());
        }

        let version = stdout.trim();
        if (!version) {
          return reject(new InvalidHlaeExecutable());
        }

        // Ignore the build number which is always 0, 2.178.0.0 => 2.178.0
        const [major, minor, patch] = version.split('.').slice(0, 3);
        if (!major || !minor || !patch) {
          return reject(new InvalidHlaeExecutable());
        }

        version = `${major}.${minor}.${patch}`;

        return resolve(version);
      },
    );
  });
}
