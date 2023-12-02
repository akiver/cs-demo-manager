import fs from 'fs-extra';
import path from 'node:path';
import type { Game } from 'csdm/common/types/counter-strike';
import { getUserMapsRadarsFolderPath } from 'csdm/node/filesystem/maps/get-user-maps-radars-folder-path';
import { getMapsRadarsFolderPath } from './get-maps-radars-folder-path';

async function getMapRadarFilePathInAppFolder(mapName: string, game: Game) {
  const radarsFolderPath = getMapsRadarsFolderPath(game);
  const radarFilePath = path.join(radarsFolderPath, `${mapName}.png`);
  const radarFileExists = await fs.pathExists(radarFilePath);

  return radarFileExists ? radarFilePath : undefined;
}

async function getMapRadarFilePathInUserFolder(mapName: string, game: Game) {
  const radarsFolderPath = getUserMapsRadarsFolderPath(game);
  const radarFilePath = path.join(radarsFolderPath, `${mapName}.png`);
  const radarFileExists = await fs.pathExists(radarFilePath);

  return radarFileExists ? radarFilePath : undefined;
}

export async function getMapRadarFilePath(mapName: string, game: Game) {
  const radarFilePathInUserFolder = await getMapRadarFilePathInUserFolder(mapName, game);
  if (radarFilePathInUserFolder) {
    return radarFilePathInUserFolder;
  }

  const radarFilePathInAppFolder = await getMapRadarFilePathInAppFolder(mapName, game);
  return radarFilePathInAppFolder;
}
