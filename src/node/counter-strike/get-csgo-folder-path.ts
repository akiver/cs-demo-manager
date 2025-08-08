import fs from 'fs-extra';
import path from 'node:path';
import VDF from 'vdf-parser';
import { getSteamFolderPath } from './get-steam-folder-path';
import { CounterStrikeExecutableNotFound } from './launcher/errors/counter-strike-executable-not-found';
import { Game } from 'csdm/common/types/counter-strike';
import { getCustomCounterStrikeExecutablePath } from './get-custom-counter-strike-executable-path';
import { isWindows } from '../os/is-windows';

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

function buildFolderPathFromCustomExecutablePath(customExecutablePath: string, game: Game) {
  const executableFolderPath = path.dirname(customExecutablePath);
  if (game === Game.CSGO) {
    return executableFolderPath;
  }

  if (isWindows) {
    // The folder is the one 3 levels up from the executable.
    //    C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\game\bin\win64\cs2.exe
    // -> C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive
    return path.join(executableFolderPath, '..', '..', '..');
  }

  // cs2.sh is in the 'game' folder, so we need to go up one level.
  //    /home/user/.steam/debian-installation/steamapps/common/Counter-Strike Global Offensive/game/cs2.sh
  // -> /home/user/.steam/debian-installation/steamapps/common/Counter-Strike Global Offensive
  return path.join(executableFolderPath, '..');
}

// Returns the default "Counter-Strike Global Offensive" folder where CS is installed through Steam or the equivalent
// path when using a custom executable path.
export async function getCsgoFolderPathOrThrow(game: Game) {
  let folderPath: string | undefined;
  const customExecutablePath = await getCustomCounterStrikeExecutablePath(game);
  if (customExecutablePath) {
    folderPath = buildFolderPathFromCustomExecutablePath(customExecutablePath, game);
  } else {
    folderPath = await getCsgoFolderPath();
  }

  if (!folderPath) {
    throw new CounterStrikeExecutableNotFound(game);
  }

  return folderPath;
}
