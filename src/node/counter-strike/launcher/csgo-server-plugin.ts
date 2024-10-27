import path from 'node:path';
import fs from 'fs-extra';
import { getStaticFolderPath } from 'csdm/node/filesystem/get-static-folder-path';
import { getCsgoFolderPathOrThrow } from '../get-csgo-folder-path';
import { Game } from 'csdm/common/types/counter-strike';
import { isWindows } from 'csdm/node/os/is-windows';
import { isMac } from 'csdm/node/os/is-mac';

async function getServerPluginFolder() {
  const csgoFolderPath = await getCsgoFolderPathOrThrow(Game.CSGO);
  return path.join(csgoFolderPath, 'csgo', 'addons');
}

function getBinaryFileName() {
  return isWindows ? 'csdm.dll' : isMac ? 'csdm.dylib' : 'csdm_client.so';
}

export async function installCsGoServerPlugin() {
  try {
    logger.log('Installing CSGO server plugin');
    const pluginFolder = await getServerPluginFolder();
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
    const pluginFolder = await getServerPluginFolder();
    const binaryName = getBinaryFileName();

    await Promise.all([fs.remove(path.join(pluginFolder, binaryName)), fs.remove(path.join(pluginFolder, 'csdm.vdf'))]);
  } catch (error) {
    logger.error('Uninstalling CSGO server plugin failed');
    logger.error(error);
  }
}
