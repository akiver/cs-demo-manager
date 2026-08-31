import { InvalidHlaeExecutable } from '../errors/invalid-hlae-executable';
import { getWindowsExeVersion } from 'csdm/node/os/get-windows-exe-version';

function isValidExecutablePath(executablePath: string) {
  return executablePath.toLocaleLowerCase().endsWith('hlae.exe');
}

export async function getHlaeVersionFromExecutable(executablePath: string): Promise<string | undefined> {
  if (!isValidExecutablePath(executablePath)) {
    throw new InvalidHlaeExecutable();
  }

  const version = await getWindowsExeVersion(executablePath);

  // The executable version may contain a build number (x.x.x.x), keep only x.x.x to reflect GitHub releases.
  return version?.split('.').slice(0, 3).join('.');
}
