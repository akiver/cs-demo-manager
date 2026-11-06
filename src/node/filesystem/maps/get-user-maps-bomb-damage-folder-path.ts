import path from 'node:path';
import { Game } from 'csdm/common/types/counter-strike';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

export function getUserMapsBombDamageFolderPath(game: Game) {
  const gameFolder = game === Game.CSGO ? 'csgo' : 'cs2';

  return path.join(getAppFolderPath(), 'maps', gameFolder, 'bomb-damage');
}
