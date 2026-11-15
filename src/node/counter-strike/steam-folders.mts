// Also imported by scripts/*.mjs, so only Node builtins and packages can be imported here (no csdm/* alias).
// Scripts must define the logger global before calling these functions.
import path from 'node:path';
import { homedir } from 'node:os';
import fs from 'fs-extra';
import VDF from 'vdf-parser';
import { Game } from '@akiver/cs-demo-analyzer';

type LibraryFolders = {
  libraryfolders: Record<string, { path: string; apps?: Record<string, string> }>;
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

type SteamApp = {
  appId: string;
  folderName: string; // Folder name inside <library>/steamapps/common
};

// CS:GO is a standalone Steam app since Valve released it on the Steam store, other games are played from the CS2 app.
// https://store.steampowered.com/app/4465480/CounterStrikeGlobal_Offensive/
function getGameSteamApp(game: Game): SteamApp {
  if (game === Game.CSGO) {
    return { appId: '4465480', folderName: 'csgo legacy' };
  }

  return { appId: '730', folderName: 'Counter-Strike Global Offensive' };
}

/**
 * Return the path to the folder where the given app is installed, looking at each Steam library listed in the file
 * steamapps/libraryfolders.vdf of the given Steam folder.
 * https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration#Locating_CS:GO_Install_Directory
 */
async function findSteamAppFolderPath(steamFolderPath: string, app: SteamApp) {
  const vdfPath = path.join(steamFolderPath, 'steamapps', 'libraryfolders.vdf');
  const vdfFileExists = await fs.pathExists(vdfPath);
  if (!vdfFileExists) {
    logger.log(`Steam libraries file not found at ${vdfPath}`);
    return;
  }

  const vdfContent = await fs.readFile(vdfPath, 'utf-8');
  const data = VDF.parse<LibraryFolders>(vdfContent);
  for (const index in data.libraryfolders) {
    const entry = data.libraryfolders[index];
    const hasApp = Object.keys(entry.apps ?? {}).includes(app.appId);
    if (!hasApp) {
      continue;
    }

    const appFolderPath = path.join(entry.path, 'steamapps', 'common', app.folderName);
    const appFolderExists = await fs.pathExists(appFolderPath);
    if (appFolderExists) {
      return appFolderPath;
    }
  }

  logger.log(`App ${app.appId} (${app.folderName}) folder not found in libraryfolders.vdf`);
  logger.log(vdfContent);
}

/**
 * Return the path to the folder where the given game is installed through Steam.
 * CS2: "Counter-Strike Global Offensive"
 * CS:GO: "csgo legacy"
 */
export async function getCsgoFolderPath(game: Game) {
  const steamFolderPath = await getSteamFolderPath();
  if (steamFolderPath === undefined) {
    return;
  }

  return findSteamAppFolderPath(steamFolderPath, getGameSteamApp(game));
}

export async function getSteamLinuxRuntimeSniperFolderPath() {
  const steamFolderPath = await getSteamFolderPath();
  if (steamFolderPath === undefined) {
    return;
  }

  // Steam Linux Runtime 3.0 (sniper), the container used by Steam to run CS2 on Linux.
  // Steam installs it as a regular app in one of the Steam libraries, usually the one where CS2 is installed.
  const steamLinuxRuntimeSniperApp: SteamApp = {
    appId: '1628350',
    folderName: 'SteamLinuxRuntime_sniper',
  };

  return findSteamAppFolderPath(steamFolderPath, steamLinuxRuntimeSniperApp);
}
