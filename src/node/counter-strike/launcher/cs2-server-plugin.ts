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

// 1. Copy the server binary to the game folder
// 2. Patch gameinfo.gi to tell the game to load the plugin
export async function installCs2ServerPlugin() {
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
}

export async function uninstallCs2ServerPlugin() {
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
