import path from 'node:path';
import fs from 'fs-extra';
import type { Game } from 'csdm/common/types/counter-strike';
import { getCounterStrikeExecutablePath } from './get-counter-strike-executable-path';
import { FileNotFound } from '../filesystem/errors/file-not-found';
import { ErrorCode } from 'csdm/common/error-code';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';

// Returns the path to the Counter-Strike log file which is next to the game executable.
export async function getCounterStrikeLogFilePath(game: Game) {
  let logFilePath: string = '';
  try {
    const executablePath = await getCounterStrikeExecutablePath(game);
    logFilePath = path.join(path.dirname(executablePath), 'csdm.log');
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
