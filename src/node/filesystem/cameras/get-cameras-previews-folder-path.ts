import path from 'node:path';
import { getImagesFolderPath } from '../get-images-folder-path';

export function getCamerasPreviewsFolderPath() {
  const imagesFolderPath = getImagesFolderPath();

  return path.join(imagesFolderPath, 'cameras');
}
