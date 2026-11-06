import fs from 'fs-extra';
import path from 'node:path';
import type { Game } from 'csdm/common/types/counter-strike';
import { getMapsBombDamageFolderPath } from './get-maps-bomb-damage-folder-path';
import { getUserMapsBombDamageFolderPath } from './get-user-maps-bomb-damage-folder-path';

export async function getMapBombDamageFilePath(mapName: string, game: Game) {
  const fileName = `${mapName}.json.gz`;
  // Files in the user folder take precedence over the ones shipped with the app.
  const folderPaths = [getUserMapsBombDamageFolderPath(game), getMapsBombDamageFolderPath(game)];
  for (const folderPath of folderPaths) {
    const filePath = path.join(folderPath, fileName);
    if (await fs.pathExists(filePath)) {
      return filePath;
    }
  }

  return undefined;
}
