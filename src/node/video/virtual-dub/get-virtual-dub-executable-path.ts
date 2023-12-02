import path from 'node:path';
import { getVirtualDubFolderPath } from './get-virtual-dub-folder-path';

export function getVirtualDubExecutablePath(): string {
  const installationPath = getVirtualDubFolderPath();
  const executableName = process.arch === 'x64' ? 'Veedub64' : 'VirtualDub';

  return path.join(installationPath, `${executableName}.exe`);
}
