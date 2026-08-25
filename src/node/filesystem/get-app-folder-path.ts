import { resolveAppFolderPath } from './resolve-app-folder-path';

export function getAppFolderPath() {
  return resolveAppFolderPath(IS_DEV);
}
