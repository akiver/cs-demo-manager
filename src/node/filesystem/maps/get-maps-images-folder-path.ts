import path from 'node:path';
import { getImagesFolderPath } from 'csdm/node/filesystem/get-images-folder-path';

export function getMapsImagesFolderPath() {
  const imagesFolderPath = getImagesFolderPath();

  return path.join(imagesFolderPath, 'maps');
}
