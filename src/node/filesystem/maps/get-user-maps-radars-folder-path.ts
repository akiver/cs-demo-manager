import path from 'node:path';
import { getUserMapsImagesFolderPath } from 'csdm/node/filesystem/maps/get-user-maps-images-folder-path';
import type { Game } from 'csdm/common/types/counter-strike';

export function getUserMapsRadarsFolderPath(game: Game) {
  const userMapsImagesFolderPath = getUserMapsImagesFolderPath(game);

  return path.join(userMapsImagesFolderPath, 'radars');
}
