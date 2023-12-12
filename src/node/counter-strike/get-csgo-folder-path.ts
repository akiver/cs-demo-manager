import fs from 'fs-extra';
import path from 'node:path';
import VDF from 'vdf-parser';
import { getSteamFolderPath } from './get-steam-folder-path';
import { CounterStrikeExecutableNotFound } from './launcher/errors/counter-strike-executable-not-found';
import type { Game } from 'csdm/common/types/counter-strike';

type LibraryFolders = { libraryfolders: Record<string, { path: string; apps: Record<string, string> }> };

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

  const vdfContent = await fs.readFile(vdfPath, 'utf-8');
  const data = VDF.parse<LibraryFolders>(vdfContent);

  for (const index in data.libraryfolders) {
    const entry = data.libraryfolders[index];
    const hasCsApp = Object.keys(entry.apps).includes('730');
    if (!hasCsApp) {
      continue;
    }

    const csgoFolderPath = path.join(entry.path, 'steamapps', 'common', 'Counter-Strike Global Offensive');
    const csgoFolderExists = await fs.pathExists(csgoFolderPath);
    if (csgoFolderExists) {
      return csgoFolderPath;
    }
  }

  logger.log('CSGO folder not found in libraryfolders.vdf');
  logger.log(vdfContent);
}

export async function getCsgoFolderPathOrThrow(game: Game) {
  const csgoFolderPath = await getCsgoFolderPath();
  if (csgoFolderPath === undefined) {
    throw new CounterStrikeExecutableNotFound(game);
  }

  return csgoFolderPath;
}
