import path from 'node:path';
import fs from 'fs-extra';
import { Game } from 'csdm/common/types/counter-strike';
import { isMac } from 'csdm/node/os/is-mac';
import { isWindows } from 'csdm/node/os/is-windows';
import { getCsgoFolderPath } from './get-csgo-folder-path';
import { CounterStrikeExecutableNotFound } from './launcher/errors/counter-strike-executable-not-found';
import { getCustomCounterStrikeExecutablePath } from './get-custom-counter-strike-executable-path';

async function getWindowsCsExecutablePath(csgoFolderPath: string, game: Game) {
  const executablePath =
    game === Game.CSGO
      ? path.join(csgoFolderPath, 'csgo.exe')
      : path.join(csgoFolderPath, 'game', 'bin', 'win64', 'cs2.exe');

  const executableExists = await fs.pathExists(executablePath);
  if (!executableExists) {
    logger.log('CS executable not found at:', executablePath);
    throw new CounterStrikeExecutableNotFound(game);
  }

  return executablePath;
}

async function getLinuxCsRunScriptPath(csgoFolderPath: string, game: Game) {
  const scriptPath =
    game === Game.CSGO ? path.join(csgoFolderPath, 'csgo.sh') : path.join(csgoFolderPath, 'game', 'cs2.sh');
  const scriptExists = await fs.pathExists(scriptPath);
  if (!scriptExists) {
    logger.log('CS run script not found at:', scriptPath);
    throw new CounterStrikeExecutableNotFound(game);
  }

  return scriptPath;
}

async function getMacosCsgoRunScriptPath(csgoFolderPath: string) {
  const scriptPath = path.join(csgoFolderPath, 'csgo.sh');
  const scriptExists = await fs.pathExists(scriptPath);
  if (!scriptExists) {
    logger.log('CS run script not found at:', scriptPath);
    throw new CounterStrikeExecutableNotFound(Game.CSGO);
  }

  // ! Double quotes are important on macOS
  return `"${scriptPath}"`;
}

// Returns the path to the Counter-Strike executable on Windows and the path to the script to start CS on Unix-like systems.
export async function getCounterStrikeExecutablePath(game: Game): Promise<string> {
  const customExecutablePath = await getCustomCounterStrikeExecutablePath(game);
  if (customExecutablePath) {
    logger.log('Using custom CS executable path:', customExecutablePath);
    return customExecutablePath;
  }

  const csgoFolderPath = await getCsgoFolderPath();
  logger.log('CSGO folder path:', csgoFolderPath);
  if (!csgoFolderPath) {
    throw new CounterStrikeExecutableNotFound(game);
  }

  if (isWindows) {
    return getWindowsCsExecutablePath(csgoFolderPath, game);
  }

  if (isMac) {
    return getMacosCsgoRunScriptPath(csgoFolderPath);
  }

  return getLinuxCsRunScriptPath(csgoFolderPath, game);
}
