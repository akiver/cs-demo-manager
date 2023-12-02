import fs from 'fs-extra';
import type { Game } from 'csdm/common/types/counter-strike';
import { getMapLowerRadarFilePath } from './get-map-lower-radar-file-path';

export async function getMapLowerRadarBase64(mapName: string, game: Game) {
  const filePath = await getMapLowerRadarFilePath(mapName, game);
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
