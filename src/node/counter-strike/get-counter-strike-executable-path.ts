import path from 'node:path';
import fs from 'fs-extra';
import { glob } from 'csdm/node/filesystem/glob';
import { Game } from 'csdm/common/types/counter-strike';
import { isMac } from 'csdm/node/os/is-mac';
import { isWindows } from 'csdm/node/os/is-windows';
import { getCsgoFolderPath } from './get-csgo-folder-path';
import { getSteamFolderPath } from './get-steam-folder-path';
import { CounterStrikeExecutableNotFound } from './launcher/errors/counter-strike-executable-not-found';

// Tip: to understand how Steam starts CS you can use the Steam client launch options: -dev -console
// You would be able to see the command used to start CS in the console.
export async function getCounterStrikeExecutablePath(game: Game): Promise<string> {
  const csgoFolderPath = await getCsgoFolderPath();
  if (csgoFolderPath === undefined) {
    throw new CounterStrikeExecutableNotFound(game);
  }

  if (isWindows) {
    let executablePath: string;
    if (game === Game.CS2) {
      executablePath = path.join(csgoFolderPath, 'game', 'bin', 'win64', 'cs2.exe');
    } else {
      executablePath = path.join(csgoFolderPath, 'csgo.exe');
    }

    const executableExists = await fs.pathExists(executablePath);
    if (!executableExists) {
      throw new CounterStrikeExecutableNotFound(game);
    }

    return executablePath;
  }

  if (isMac) {
    const runCsgoScriptPath = path.join(csgoFolderPath, 'csgo.sh');
    const scriptExists = await fs.pathExists(runCsgoScriptPath);
    if (!scriptExists) {
      throw new CounterStrikeExecutableNotFound(game);
    }
    // ! Double quotes are important on macOS
    return `"${runCsgoScriptPath}"`;
  }

  const steamFolderPath = await getSteamFolderPath();
  /**
   * On Linux CS must be launched through a Steam Linux Runtime script.
   * This script takes the path to the game's run script as parameter (csgo.sh for CSGO and cs2.sh for CS2).
   * Trying to run CS directly from the game script will not work because it doesn't export runtime libraries paths
   * that depend on the OS arch.
   */
  const steamScriptName = game === Game.CS2 ? 'SteamLinuxRuntime_sniper/_v2-entry-point' : 'steam-runtime/run.sh';
  const [runSteamScriptPath] = await glob(`**/${steamScriptName}`, {
    cwd: steamFolderPath,
    absolute: true,
    followSymbolicLinks: false,
  });
  if (!runSteamScriptPath) {
    throw new CounterStrikeExecutableNotFound(game);
  }
  let gameScriptPath: string;
  if (game === Game.CSGO) {
    gameScriptPath = path.join(csgoFolderPath, 'csgo.sh');
  } else {
    gameScriptPath = path.join(csgoFolderPath, 'game', 'cs2.sh');
  }

  const scriptExists = await fs.pathExists(gameScriptPath);
  if (!scriptExists) {
    throw new CounterStrikeExecutableNotFound(game);
  }

  const command =
    game === Game.CS2
      ? `"${runSteamScriptPath}" --verb=waitforexitandrun -- "${gameScriptPath}"`
      : `"${runSteamScriptPath}" "${gameScriptPath}"`;

  return command;
}
