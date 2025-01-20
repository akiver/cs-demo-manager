import path from 'node:path';
import fs from 'fs-extra';
import { getStaticFolderPath } from 'csdm/node/filesystem/get-static-folder-path';
import { getCsgoFolderPathOrThrow } from '../get-csgo-folder-path';
import { Game } from 'csdm/common/types/counter-strike';
import { isWindows } from 'csdm/node/os/is-windows';
import { isMac } from 'csdm/node/os/is-mac';

function getServerPluginFolder(csgoFolderPath: string) {
  return path.join(csgoFolderPath, 'csgo', 'addons');
}

function getBinaryFileName() {
  return isWindows ? 'csdm.dll' : isMac ? 'csdm.dylib' : 'csdm_client.so';
}

async function deleteLogFile(csgoFolderPath: string) {
  const logFilePath = path.join(csgoFolderPath, 'csdm.log');
  await fs.remove(logFilePath);
}

export async function installCsGoServerPlugin() {
  try {
    logger.log('Installing CSGO server plugin');
    const csgoFolderPath = await getCsgoFolderPathOrThrow(Game.CSGO);
    const pluginFolder = getServerPluginFolder(csgoFolderPath);
    await deleteLogFile(csgoFolderPath);
    await fs.mkdirp(pluginFolder);
    const binaryName = getBinaryFileName();
    const staticFolderPath = getStaticFolderPath();
    await Promise.all([
      fs.copyFile(path.join(staticFolderPath, binaryName), path.join(pluginFolder, binaryName)),
      fs.copyFile(path.join(staticFolderPath, 'csdm.vdf'), path.join(pluginFolder, 'csdm.vdf')),
    ]);
  } catch (error) {
    logger.error('Installing CSGO server plugin failed');
    logger.error(error);
  }
}

export async function uninstallCsGoServerPlugin() {
  try {
    logger.log('Uninstalling CSGO server plugin');
    const csgoFolderPath = await getCsgoFolderPathOrThrow(Game.CSGO);
    const pluginFolder = getServerPluginFolder(csgoFolderPath);
    const binaryName = getBinaryFileName();

    await Promise.all([fs.remove(path.join(pluginFolder, binaryName)), fs.remove(path.join(pluginFolder, 'csdm.vdf'))]);
  } catch (error) {
    logger.error('Uninstalling CSGO server plugin failed');
    logger.error(error);
  }
}
