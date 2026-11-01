import path from 'node:path';
import { getAppFolderPath } from './get-app-folder-path';

export function getLogFolderPath() {
  return path.join(getAppFolderPath(), 'logs');
}
