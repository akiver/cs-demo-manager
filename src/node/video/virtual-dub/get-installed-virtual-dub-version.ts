import fs from 'fs-extra';
import { getVirtualDubVersionFilePath } from './get-virtual-dub-version-file-path';
import { getVirtualDubExecutablePath } from './get-virtual-dub-executable-path';

export async function getInstalledVirtualDubVersion(): Promise<string | undefined> {
  const versionFilePath = getVirtualDubVersionFilePath();
  if (!(await fs.pathExists(versionFilePath)) || !(await fs.pathExists(getVirtualDubExecutablePath()))) {
    return undefined;
  }

  const version = await fs.readFile(versionFilePath, 'utf8');

  return version;
}
