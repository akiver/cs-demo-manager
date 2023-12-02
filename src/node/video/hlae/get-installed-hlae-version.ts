import fs from 'fs-extra';
import { getHlaeVersionFromExecutable } from 'csdm/node/video/hlae/get-hlae-version-from-executable';
import { InvalidHlaeExecutable } from '../errors/invalid-hlae-executable';
import { getHlaeExecutablePath } from './hlae-location';

export async function getInstalledHlaeVersion(): Promise<string | undefined> {
  const executablePath = await getHlaeExecutablePath();
  const executableExists = await fs.pathExists(executablePath);
  if (!executableExists) {
    return undefined;
  }

  try {
    const version = await getHlaeVersionFromExecutable(executablePath);

    return version;
  } catch (error) {
    if (error instanceof InvalidHlaeExecutable) {
      return undefined;
    }
    throw error;
  }
}
