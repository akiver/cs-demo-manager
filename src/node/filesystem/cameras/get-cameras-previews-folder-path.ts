import path from 'node:path';
import { getUserImagesFolderPath } from '../get-user-images-folder-path';

export function getCamerasPreviewsFolderPath() {
  const userImagesFolderPath = getUserImagesFolderPath();

  return path.join(userImagesFolderPath, 'cameras');
}
