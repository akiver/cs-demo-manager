import path from 'node:path';
import { getMapsImagesFolderPath } from './get-maps-images-folder-path';

export function getUnknownMapThumbnailFilePath() {
  const mapsImagesFolderPath = getMapsImagesFolderPath();

  return path.join(mapsImagesFolderPath, 'thumbnail_unknown.png');
}
