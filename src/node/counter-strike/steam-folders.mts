// Also imported by scripts/*.mjs, so only Node builtins and packages can be imported here (no csdm/* alias).
// Scripts must define the logger global before calling these functions.
import path from 'node:path';
import { homedir } from 'node:os';
import fs from 'fs-extra';
import VDF from 'vdf-parser';
import { Game } from '@akiver/cs-demo-analyzer';

type LibraryFolders = {
  libraryfolders: Record<string, { path: string; apps: Record<string, string> }>;
};

/**
 * Transforms Steam paths from Windows registry.
 * c:/program files (x86)/steam/steam.exe => C:\\program files (x86)\\steam\\steam.exe
 */
function sanitizePathFromRegistry(path: string) {
  return `${path.charAt(0).toUpperCase()}${path.slice(1).replace(/\//gi, '\\')}`;
}

async function getSteamPathFromRegistry() {
  try {
    const { HKEY, enumerateValues } = await import('registry-js');
    const entry = enumerateValues(HKEY.HKEY_CURRENT_USER, 'Software\\Valve\\Steam').find((value) => {
      return value.name === 'SteamPath';
    });

    return typeof entry?.data === 'string' ? entry.data : undefined;
  } catch (error) {
    logger.error(error);
    return undefined;
  }
}

export async function getSteamFolderPath() {
  if (process.platform === 'win32') {
    const data = await getSteamPathFromRegistry();
    if (!data) {
      return undefined;
    }

    return sanitizePathFromRegistry(data);
  }

  if (process.platform === 'darwin') {
    return path.join(homedir(), 'Library', 'Application Support', 'Steam');
  }

  const steamHomePath = path.join(homedir(), '.steam', 'steam');
  const isSteamInHomePath = await fs.pathExists(steamHomePath);
  if (isSteamInHomePath) {
    return steamHomePath;
  }

  const steamSnapPath = path.join(homedir(), 'snap', 'steam', 'common', '.local', 'share', 'Steam');
  if (await fs.pathExists(steamSnapPath)) {
    return steamSnapPath;
  }

  return path.join(homedir(), '.local', 'share', 'Steam');
}

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
