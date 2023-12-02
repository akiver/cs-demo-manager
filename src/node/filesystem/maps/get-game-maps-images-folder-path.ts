import path from 'node:path';
import { Game } from 'csdm/common/types/counter-strike';
import { getMapsImagesFolderPath } from './get-maps-images-folder-path';

export function getGameMapsImagesFolderPath(game: Game) {
  const imagesFolderPath = getMapsImagesFolderPath();
  const gameFolder = game === Game.CSGO ? 'csgo' : 'cs2';

  return path.join(imagesFolderPath, gameFolder);
}
