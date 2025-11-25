import path from 'node:path';
import { getVirtualDubFolderPath } from './get-virtual-dub-folder-path';

export function getVirtualDubVersionFilePath() {
  const virtualDubFolderPath = getVirtualDubFolderPath();
  return path.join(virtualDubFolderPath, 'version');
}
