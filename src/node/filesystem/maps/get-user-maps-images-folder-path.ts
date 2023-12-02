import path from 'node:path';
import { Game } from 'csdm/common/types/counter-strike';
import { getUserImagesFolderPath } from 'csdm/node/filesystem/get-user-images-folder-path';

export function getUserMapsImagesFolderPath(game: Game) {
  const gameFolder = game === Game.CSGO ? 'csgo' : 'cs2';

  return path.join(getUserImagesFolderPath(), 'maps', gameFolder);
}
