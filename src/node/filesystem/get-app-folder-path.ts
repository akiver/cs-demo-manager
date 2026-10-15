import { resolveAppFolderPath } from './resolve-app-folder-path.mjs';

export function getAppFolderPath() {
  return resolveAppFolderPath(IS_DEV);
}
