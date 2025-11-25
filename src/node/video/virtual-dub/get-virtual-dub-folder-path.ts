import path from 'node:path';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

export function getVirtualDubFolderPath() {
  return path.join(getAppFolderPath(), 'virtualdub');
}
