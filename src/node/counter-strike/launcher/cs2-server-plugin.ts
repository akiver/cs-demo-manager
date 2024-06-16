import path from 'node:path';
import fs from 'fs-extra';
import { getStaticFolderPath } from 'csdm/node/filesystem/get-static-folder-path';
import { server } from 'csdm/server/server';
import { GameClientMessageName } from 'csdm/server/game-client-message-name';
import { GameServerMessageName } from 'csdm/server/game-server-message-name';
import { sleep } from 'csdm/common/sleep';
import { getCsgoFolderPathOrThrow } from '../get-csgo-folder-path';
import { Game } from 'csdm/common/types/counter-strike';
import { isWindows } from 'csdm/node/os/is-windows';

function getGameInfoFilePathFromGamePath(executablePath: string) {
  return path.join(executablePath, 'game', 'csgo', 'gameinfo.gi');
}

function getServerPluginFolderFromGamePath(executablePath: string) {
  return path.join(executablePath, 'game', 'csgo', 'csdm');
}

// The below functions try to install or uninstall the server plugin 2 times because plugin files may still be locked
// by the CS2 process and so would result in a permission error if we try to replace/remove them.
// This can happens for instance when the video queue contains several videos and the current video being recorded is
// aborted (it means that the next video in the queue will be processed immediately after and so the plugin will be
// installed).
//
// 1. Uninstall the plugin if it's already installed
// 2. Copy the server binary to the game folder
// 3. Patch gameinfo.gi to tell the game to load the plugin
async function tryInstallCs2ServerPlugin() {
  try {
    logger.log('Installing CS2 server plugin');
    await uninstallCs2ServerPlugin();

    const csgoFolderPath = await getCsgoFolderPathOrThrow(Game.CS2);
    const pluginFolder = getServerPluginFolderFromGamePath(csgoFolderPath);
    const binFolderPath = isWindows ? path.join(pluginFolder, 'bin') : path.join(pluginFolder, 'bin', 'linuxsteamrt64');
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

    return true;
  } catch (error) {
    logger.error('Installing CS2 server plugin failed');
    logger.error(error);
    return false;
  }
}

export async function installCs2ServerPlugin() {
  const installed = await tryInstallCs2ServerPlugin();
  if (!installed) {
    // See top comment for details about this sleep call
    await sleep(2000);
    await tryInstallCs2ServerPlugin();
  }
}

async function tryUninstallCs2ServerPlugin() {
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

    return true;
  } catch (error) {
    logger.error('Uninstalling CS2 server plugin failed');
    logger.error(error);
    return false;
  }
}

export async function uninstallCs2ServerPlugin() {
  const uninstalled = await tryUninstallCs2ServerPlugin();
  if (!uninstalled) {
    // See top comment for details about this sleep call
    await sleep(2000);
    await tryUninstallCs2ServerPlugin();
  }
}

export async function tryStartingDemoThroughWebSocket(demoPath: string): Promise<boolean> {
  if (!server.isGameConnected()) {
    return false;
  }

  let hasReceivedMessage = false;
  const onGameResponse = () => {
    hasReceivedMessage = true;
  };

  server.addGameMessageListener(GameClientMessageName.Status, onGameResponse);

  server.sendMessageToGameProcess({
    name: GameServerMessageName.PlayDemo,
    payload: demoPath,
  });

  await sleep(1000);

  server.removeGameEventListeners(GameClientMessageName.Status);

  if (hasReceivedMessage) {
    return true;
  }

  logger.warn('CS2 is connected but we did not receive a response from it.');

  return false;
}
