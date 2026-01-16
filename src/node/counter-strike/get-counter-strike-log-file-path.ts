import path from 'node:path';
import fs from 'fs-extra';
import { Game } from 'csdm/common/types/counter-strike';
import { getCounterStrikeExecutablePath } from './get-counter-strike-executable-path';
import { FileNotFound } from '../filesystem/errors/file-not-found';
import { ErrorCode } from 'csdm/common/error-code';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { isLinux } from '../os/is-linux';

// Returns the path to the Counter-Strike log file which is next to the game executable.
export async function getCounterStrikeLogFilePath(game: Game) {
  let logFilePath = '';
  try {
    const executablePath = await getCounterStrikeExecutablePath(game);
    const executableDir = path.dirname(executablePath);

    logFilePath =
      isLinux && game !== Game.CSGO
        ? path.join(executableDir, 'bin', 'linuxsteamrt64', 'csdm.log')
        : path.join(executableDir, 'csdm.log');

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
