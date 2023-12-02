import path from 'node:path';
import fs from 'node:fs/promises';
import type { Game } from 'csdm/common/types/counter-strike';
import { getUserMapsRadarsFolderPath } from 'csdm/node/filesystem/maps/get-user-maps-radars-folder-path';

export async function writeMapLowerRadarFileFromBase64(mapName: string, game: Game, base64: string) {
  const radarsFolderPath = getUserMapsRadarsFolderPath(game);
  const lowerRadarPath = path.join(radarsFolderPath, `${mapName}_lower.png`);
  await fs.writeFile(lowerRadarPath, base64.replace(/^data:image\/png;base64,/, ''), 'base64');
}
