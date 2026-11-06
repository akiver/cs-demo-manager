import path from 'node:path';
import { getCsgoFolderPath } from './steam-folders.mjs';
import { CounterStrikeExecutableNotFound } from './launcher/errors/counter-strike-executable-not-found';
import { Game } from 'csdm/common/types/counter-strike';
import { getCustomCounterStrikeExecutablePath } from './get-custom-counter-strike-executable-path';
import { isWindows } from '../os/is-windows';

function buildFolderPathFromCustomExecutablePath(customExecutablePath: string, game: Game) {
  const executableFolderPath = path.dirname(customExecutablePath);
  if (game === Game.CSGO) {
    return executableFolderPath;
  }

  if (isWindows) {
    // The folder is the one 3 levels up from the executable.
    //    C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\game\bin\win64\cs2.exe
    // -> C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive
    return path.join(executableFolderPath, '..', '..', '..');
  }

  // cs2.sh is in the 'game' folder, so we need to go up one level.
  //    /home/user/.steam/debian-installation/steamapps/common/Counter-Strike Global Offensive/game/cs2.sh
  // -> /home/user/.steam/debian-installation/steamapps/common/Counter-Strike Global Offensive
  return path.join(executableFolderPath, '..');
}

// Returns the default folder where the game is installed through Steam or the equivalent
// path when using a custom executable path.
export async function getCsgoFolderPathOrThrow(game: Game) {
  let folderPath: string | undefined;
  const customExecutablePath = await getCustomCounterStrikeExecutablePath(game);
  if (customExecutablePath) {
    folderPath = buildFolderPathFromCustomExecutablePath(customExecutablePath, game);
  } else {
    folderPath = await getCsgoFolderPath(game);
  }

  if (!folderPath) {
    throw new CounterStrikeExecutableNotFound(game);
  }

  return folderPath;
}
