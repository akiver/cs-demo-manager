import path from 'node:path';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

export function getUserImagesFolderPath(): string {
  return path.join(getAppFolderPath(), 'images');
}
