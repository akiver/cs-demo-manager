import fs from 'fs-extra';
import path from 'node:path';
import VDF from 'vdf-parser';
import { getSteamFolderPath } from './get-steam-folder-path';
import { CounterStrikeExecutableNotFound } from './launcher/errors/counter-strike-executable-not-found';
import { Game } from 'csdm/common/types/counter-strike';
import { getCustomCounterStrikeExecutablePath } from './get-custom-counter-strike-executable-path';
import { isWindows } from '../os/is-windows';

type LibraryFolders = {
  libraryfolders: Record<string, { path: string; apps: Record<string, string> }>;
};

// CS:GO is a standalone Steam app since Valve released it on the Steam store, other games are played from the CS2 app.
// https://store.steampowered.com/app/4465480/CounterStrikeGlobal_Offensive/
function getGameSteamApp(game: Game) {
  if (game === Game.CSGO) {
    return { appId: '4465480', folderName: 'csgo legacy' };
  }

  return { appId: '730', folderName: 'Counter-Strike Global Offensive' };
}

/**
 * Return the path to the folder where the given game is installed through Steam.
 * CS2: "Counter-Strike Global Offensive"
 * CS:GO: "csgo legacy"
 * https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration#Locating_CS:GO_Install_Directory
 */
export async function getCsgoFolderPath(game: Game) {
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
  const { appId, folderName } = getGameSteamApp(game);

  for (const index in data.libraryfolders) {
    const entry = data.libraryfolders[index];
    const hasApp = Object.keys(entry.apps).includes(appId);
    if (!hasApp) {
      continue;
    }

    const gameFolderPath = path.join(entry.path, 'steamapps', 'common', folderName);
    const gameFolderExists = await fs.pathExists(gameFolderPath);
    if (gameFolderExists) {
      return gameFolderPath;
    }
  }

  logger.log(`${game} folder not found in libraryfolders.vdf`);
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

// Returns the default folder where the game is installed through Steam or the equivalent
// path when using a custom executable path.
export async function getCsgoFolderPathOrThrow(game: Game) {
  let folderPath: string | undefined;
  const customExecutablePath = await getCustomCounterStrikeExecutablePath(game);
  if (customExecutablePath) {
    folderPath = buildFolderPathFromCustomExecutablePath(customExecutablePath, game);
  } else {
    folderPath = await getCsgoFolderPath(game);
  }

  if (!folderPath) {
    throw new CounterStrikeExecutableNotFound(game);
  }

  return folderPath;
}
