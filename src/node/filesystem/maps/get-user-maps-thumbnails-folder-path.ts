import path from 'node:path';
import type { Game } from 'csdm/common/types/counter-strike';
import { getUserMapsImagesFolderPath } from 'csdm/node/filesystem/maps/get-user-maps-images-folder-path';

export function getUserMapsThumbnailsFolderPath(game: Game) {
  const userMapsImagesFolderPath = getUserMapsImagesFolderPath(game);

  return path.join(userMapsImagesFolderPath, 'thumbnails');
}
