import path from 'node:path';
import { getMapsImagesFolderPath } from './get-maps-images-folder-path';

export function getUnknownImageFilePath() {
  const mapsImagesFolderPath = getMapsImagesFolderPath();

  return path.join(mapsImagesFolderPath, 'thumbnail_unknown.png');
}
