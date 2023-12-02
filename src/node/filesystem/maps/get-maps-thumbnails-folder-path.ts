import path from 'node:path';
import type { Game } from 'csdm/common/types/counter-strike';
import { getGameMapsImagesFolderPath } from './get-game-maps-images-folder-path';

export function getMapsThumbnailsFolderPath(game: Game) {
  const mapsImagesFolderPath = getGameMapsImagesFolderPath(game);

  return path.join(mapsImagesFolderPath, 'thumbnails');
}
