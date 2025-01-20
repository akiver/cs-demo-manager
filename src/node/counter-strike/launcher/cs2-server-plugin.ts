import path from 'node:path';
import fs from 'fs-extra';
import { getStaticFolderPath } from 'csdm/node/filesystem/get-static-folder-path';
import { getCsgoFolderPathOrThrow } from '../get-csgo-folder-path';
import { Game } from 'csdm/common/types/counter-strike';
import { isWindows } from 'csdm/node/os/is-windows';

function getGameInfoFilePathFromGamePath(executablePath: string) {
  return path.join(executablePath, 'game', 'csgo', 'gameinfo.gi');
}

function getServerPluginFolderFromGamePath(executablePath: string) {
  return path.join(executablePath, 'game', 'csgo', 'csdm');
}

async function deleteLogFile(csgoFolderPath: string) {
  const paths = ['game', 'bin'];
  if (isWindows) {
    paths.push('win64');
  }
  const logFilePath = path.join(csgoFolderPath, ...paths, 'csdm.log');
  await fs.remove(logFilePath);
}

export async function installCs2ServerPlugin() {
  try {
    logger.log('Installing CS2 server plugin');

    const csgoFolderPath = await getCsgoFolderPathOrThrow(Game.CS2);
    const pluginFolder = getServerPluginFolderFromGamePath(csgoFolderPath);
    const binFolderPath = isWindows ? path.join(pluginFolder, 'bin') : path.join(pluginFolder, 'bin', 'linuxsteamrt64');
    await deleteLogFile(csgoFolderPath);
    await fs.mkdirp(binFolderPath);
    const binaryName = isWindows ? 'server.dll' : 'libserver.so';
    await fs.copyFile(path.join(getStaticFolderPath(), binaryName), path.join(binFolderPath, binaryName));

    const gameInfoFilePath = getGameInfoFilePathFromGamePath(csgoFolderPath);
    const content = await fs.readFile(gameInfoFilePath, 'utf8');
    if (!content.includes('Game\tcsgo/csdm')) {
      await fs.copyFile(gameInfoFilePath, `${gameInfoFilePath}.backup`);
      const newContent = content.replace('Game\tcsgo', 'Game\tcsgo/csdm\n\t\t\tGame\tcsgo');
      await fs.writeFile(gameInfoFilePath, newContent);
    }
  } catch (error) {
    logger.error('Installing CS2 server plugin failed');
    logger.error(error);
  }
}

export async function uninstallCs2ServerPlugin() {
  try {
    logger.log('Uninstalling CS2 server plugin');
    const csgoFolderPath = await getCsgoFolderPathOrThrow(Game.CS2);
    const pluginFolder = getServerPluginFolderFromGamePath(csgoFolderPath);
    await fs.remove(pluginFolder);

    const gameInfoFilePath = getGameInfoFilePathFromGamePath(csgoFolderPath);
    const backupFilePath = `${gameInfoFilePath}.backup`;
    const backupFileExists = await fs.pathExists(backupFilePath);
    if (backupFileExists) {
      await fs.copyFile(backupFilePath, gameInfoFilePath);
      await fs.remove(backupFilePath);
    }
  } catch (error) {
    logger.error('Uninstalling CS2 server plugin failed');
    logger.error(error);
  }
}
