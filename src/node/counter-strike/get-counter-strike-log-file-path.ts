import path from 'node:path';
import fs from 'fs-extra';
import { Game } from 'csdm/common/types/counter-strike';
import { getCounterStrikeExecutablePath } from './get-counter-strike-executable-path';
import { FileNotFound } from '../filesystem/errors/file-not-found';
import { ErrorCode } from 'csdm/common/error-code';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { isLinux } from '../os/is-linux';

// The CS:GO and CS2 plugins write their logs next to the game executable, in the game process working directory.
async function getCounterStrikeLogFolderPath(game: Game) {
  const executablePath = await getCounterStrikeExecutablePath(game);
  const executableDir = path.dirname(executablePath);

  // On Linux the CS2 executable lives in bin/linuxsteamrt64 below the cs2.sh script the app starts.
  if (isLinux && game !== Game.CSGO) {
    return path.join(executableDir, 'bin', 'linuxsteamrt64');
  }

  return executableDir;
}

export async function getCounterStrikeLogFilePath(game: Game) {
  let logFilePath = '';
  try {
    const folderPath = await getCounterStrikeLogFolderPath(game);
    logFilePath = path.join(folderPath, 'csdm.log');

    if (!(await fs.pathExists(logFilePath))) {
      throw new FileNotFound(logFilePath);
    }
    return logFilePath;
  } catch (error) {
    const errorCode = getErrorCodeFromError(error);
    if (errorCode === ErrorCode.UnknownError) {
      logger.error('Error getting Counter-Strike log file path');
      logger.error(error);
    }

    const notFoundCodes: ErrorCode[] = [
      ErrorCode.CounterStrikeExecutableNotFound,
      ErrorCode.CustomCounterStrikeExecutableNotFound,
    ];
    if (notFoundCodes.includes(errorCode)) {
      throw new FileNotFound(logFilePath);
    }

    throw error;
  }
}
