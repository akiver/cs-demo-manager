import fs from 'fs-extra';
import type { Game } from 'csdm/common/types/counter-strike';
import { getMapRadarFilePath } from 'csdm/node/filesystem/maps/get-map-radar-file-path';

export async function getMapRadarBase64(mapName: string, game: Game) {
  const filePath = await getMapRadarFilePath(mapName, game);
  if (!filePath) {
    return undefined;
  }

  const fileExists = await fs.pathExists(filePath);
  if (!fileExists) {
    return undefined;
  }

  const data = await fs.readFile(filePath, 'base64');

  return `data:image/png;base64,${data}`;
}
