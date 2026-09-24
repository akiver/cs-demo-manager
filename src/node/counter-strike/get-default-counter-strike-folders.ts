import fs from 'fs-extra';
import path from 'node:path';
import { Game } from 'csdm/common/types/counter-strike';
import { getCsgoFolderPath } from './get-csgo-folder-path';

/**
 * Detects and returns the "csgo" and "replays" folder where demos are stored.
 */
async function getDefaultFolders(game: Game, subFolderPaths: string[]) {
  const rootPath = await getCsgoFolderPath(game);
  if (rootPath === undefined) {
    return [];
  }

  const gameFolderPath = path.join(rootPath, ...subFolderPaths);
  const gameFolderExists = await fs.pathExists(gameFolderPath);
  if (!gameFolderExists) {
    return [];
  }

  const replaysFolderPath = path.join(gameFolderPath, 'replays');
  await fs.mkdirp(replaysFolderPath);

  return [gameFolderPath, replaysFolderPath];
}

export async function getDefaultCsgoFolders() {
  return await getDefaultFolders(Game.CSGO, ['csgo']);
}

export async function getDefaultCs2Folders() {
  return await getDefaultFolders(Game.CS2, ['game', 'csgo']);
}
