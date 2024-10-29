import path from 'node:path';
import fs from 'fs-extra';
import { homedir } from 'node:os';
import { isMac } from 'csdm/node/os/is-mac';
import { isWindows } from 'csdm/node/os/is-windows';
import { getRegistryStringKey } from 'csdm/node/os/windows-registry';

/**
 * Transforms Steam paths from Windows registry.
 * c:/program files (x86)/steam/steam.exe => C:\\program files (x86)\\steam\\steam.exe
 */
function sanitizePathFromRegistry(path: string) {
  return `${path.charAt(0).toUpperCase()}${path.slice(1).replace(/\//gi, '\\')}`;
}

export async function getSteamFolderPath() {
  if (isWindows) {
    const data = await getRegistryStringKey({
      path: 'Software\\Valve\\Steam',
      name: 'SteamPath',
    });
    if (!data) {
      return undefined;
    }

    const steamFolderPath = sanitizePathFromRegistry(data);
    return steamFolderPath;
  }

  if (isMac) {
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

  return path.join(homedir(), '.local', 'share', 'steam');
}
