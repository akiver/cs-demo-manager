import { InvalidHlaeExecutable } from '../errors/invalid-hlae-executable';
import { getWindowsExeVersion } from 'csdm/node/os/get-windows-exe-version';

function isValidExecutablePath(executablePath: string) {
  return executablePath.toLocaleLowerCase().endsWith('hlae.exe');
}

export async function getHlaeVersionFromExecutable(executablePath: string): Promise<string | undefined> {
  if (!isValidExecutablePath(executablePath)) {
    throw new InvalidHlaeExecutable();
  }

  return await getWindowsExeVersion(executablePath);
}
