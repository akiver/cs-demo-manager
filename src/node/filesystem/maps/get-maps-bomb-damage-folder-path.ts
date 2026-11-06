import path from 'node:path';
import { Game } from 'csdm/common/types/counter-strike';
import { getStaticFolderPath } from 'csdm/node/filesystem/get-static-folder-path';

export function getMapsBombDamageFolderPath(game: Game) {
  const gameFolder = game === Game.CSGO ? 'csgo' : 'cs2';

  return path.join(getStaticFolderPath(), 'maps', gameFolder, 'bomb-damage');
}
