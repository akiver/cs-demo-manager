import path from 'node:path';
import { getVirtualDubFolderPath } from './get-virtual-dub-folder-path';

export function getVirtualDubVersionFilePath(): string {
  const virtualDubFolderPath: string = getVirtualDubFolderPath();
  return path.join(virtualDubFolderPath, 'version');
}
