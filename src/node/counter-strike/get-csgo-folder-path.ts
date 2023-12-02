import fs from 'fs-extra';
import path from 'node:path';
import { getSteamFolderPath } from './get-steam-folder-path';
import { CounterStrikeExecutableNotFound } from './launcher/errors/counter-strike-executable-not-found';
import type { Game } from 'csdm/common/types/counter-strike';

/**
 * Return the path to the "Counter-Strike Global Offensive" folder.
 * https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration#Locating_CS:GO_Install_Directory
 *
 */
export async function getCsgoFolderPath() {
  const steamFolderPath = await getSteamFolderPath();
  if (steamFolderPath === undefined) {
    return;
  }

  const vdfPath = path.join(steamFolderPath, 'steamapps', 'libraryfolders.vdf');
  const vdfFileExists = await fs.pathExists(vdfPath);
  if (!vdfFileExists) {
    return;
  }

  // Linux / MacOS:
  // "1"		"/home/akiver/Desktop/games"
  // Windows:
  // "1"		"E:\\Steam\\Games"
  const pathRegex = /"(([a-z]:|\/)(.*))"/gi;
  const vdfContent = await fs.readFile(vdfPath);
  const lines = vdfContent.toString().split('\n');
  const libraries = [steamFolderPath];
  for (const line of lines) {
    const matches = pathRegex.exec(line);
    if (matches?.[1] !== undefined) {
      libraries.push(matches[1]);
    }
  }

  for (const library of libraries) {
    const csgoFolderPath = path.join(library, 'steamapps', 'common', 'Counter-Strike Global Offensive');
    const csgoFolderExists = await fs.pathExists(csgoFolderPath);
    if (csgoFolderExists) {
      return csgoFolderPath;
    }
  }
}

export async function getCsgoFolderPathOrThrow(game: Game) {
  const csgoFolderPath = await getCsgoFolderPath();
  if (csgoFolderPath === undefined) {
    throw new CounterStrikeExecutableNotFound(game);
  }

  return csgoFolderPath;
}
