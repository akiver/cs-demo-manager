import fs from 'fs-extra';
import { Game } from 'csdm/common/types/counter-strike';
import { getSettings } from '../settings/get-settings';
import { CustomCounterStrikeExecutableNotFound } from './launcher/errors/custom-counter-strike-executable-not-found';

export async function getCustomCounterStrikeExecutablePath(game: Game) {
  const {
    playback: { csgoExecutablePath, cs2ExecutablePath, customCs2LocationEnabled, customCsgoLocationEnabled },
  } = await getSettings();

  if (game !== Game.CSGO && !customCs2LocationEnabled) {
    return null;
  }
  if (game === Game.CSGO && !customCsgoLocationEnabled) {
    return null;
  }

  const executablePath = game === Game.CSGO ? csgoExecutablePath : cs2ExecutablePath;
  if (!executablePath) {
    return null;
  }

  const fileExists = await fs.pathExists(executablePath);
  if (!fileExists) {
    throw new CustomCounterStrikeExecutableNotFound(game);
  }

  return executablePath;
}
