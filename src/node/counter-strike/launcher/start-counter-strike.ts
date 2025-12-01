import { exec } from 'node:child_process';
import fs from 'fs-extra';
import { Game } from 'csdm/common/types/counter-strike';
import { isWindows } from 'csdm/node/os/is-windows';
import { killCounterStrikeProcesses } from '../kill-counter-strike-processes';
import { getSettings } from 'csdm/node/settings/get-settings';
import { StartCounterStrikeError } from './errors/start-counter-strike-error';
import { abortError, throwIfAborted } from 'csdm/node/errors/abort-error';
import { sleep } from 'csdm/common/sleep';
import { UnsupportedGame } from './errors/unsupported-game';
import { getCounterStrikeExecutablePath } from '../get-counter-strike-executable-path';
import { deleteJsonActionsFile } from '../json-actions-file/delete-json-actions-file';
import { isMac } from 'csdm/node/os/is-mac';
import { assertSteamIsRunning } from './assert-steam-is-running';
import { assertDemoPathIsValid } from './assert-demo-path-is-valid';
import { defineCfgFolderLocation } from './define-cfg-folder-location';
import { GameError } from './errors/game-error';
import { AccessDeniedError } from './errors/access-denied-error';
import { tryStartingDemoThroughWebSocket } from './try-starting-demo-through-web-socket';
import { installCounterStrikeServerPlugin, uninstallCounterStrikeServerPlugin } from './cs-server-plugin';
import { getSteamFolderPath } from '../get-steam-folder-path';
import { glob } from 'csdm/node/filesystem/glob';
import { CounterStrikeExecutableNotFound } from './errors/counter-strike-executable-not-found';
import { isLinux } from 'csdm/node/os/is-linux';
import type { PlaybackSettings, Settings } from 'csdm/node/settings/settings';
import { getCsgoFolderPath } from '../get-csgo-folder-path';
import path from 'node:path';

export type StartCounterStrikeOptions = {
  demoPath?: string;
  map?: string;
  game: Game;
  width?: number;
  height?: number;
  fullscreen?: boolean;
  additionalLaunchParameters?: string[];
  uninstallPluginOnExit?: boolean;
  signal?: AbortSignal;
  onGameStart?: () => void;
  mode?: 'playback' | 'spectate'; // 'spectate' starts CS on the given map with the player in free-roam spectator mode.
};

function buildUnixCommand(scriptPath: string, args: string, game: Game) {
  if (game === Game.CSGO) {
    return `${scriptPath} --args ${args}`;
  }

  return `${scriptPath} ${args}`;
}

async function buildLinuxCommand(scriptPath: string, args: string, game: Game, settings: PlaybackSettings) {
  const steamFolderPath = await getSteamFolderPath();
  /**
   * On Linux CS must be launched through a Steam Linux Runtime script.
   * This script takes the path to the game's run script as parameter (csgo.sh for CSGO and cs2.sh for CS2).
   * Trying to run CS directly from the game script will not work because it doesn't export runtime libraries paths
   * that depend on the OS arch.
   */
  const steamScriptName = game === Game.CS2 ? 'SteamLinuxRuntime_sniper/_v2-entry-point' : 'steam-runtime/run.sh';
  let runSteamScriptPath: string | undefined;
  if (settings.cs2SteamRuntimeScriptPath) {
    runSteamScriptPath = settings.cs2SteamRuntimeScriptPath;
    const scriptExists = await fs.pathExists(runSteamScriptPath);
    if (!scriptExists) {
      logger.error(`The provided Steam Linux Runtime script "${runSteamScriptPath}" doesn't exist.`);
      throw new CounterStrikeExecutableNotFound(game);
    }
    logger.debug(`Using custom Steam Linux Runtime script at "${runSteamScriptPath}"`);
  } else {
    const result = await glob(`**/${steamScriptName}`, {
      cwd: steamFolderPath,
      absolute: true,
      followSymbolicLinks: settings.followSymbolicLinks,
    });
    if (result.length === 0) {
      logger.error(
        `Cannot find the Steam Linux Runtime script "${steamScriptName}" in the Steam folder at ${steamFolderPath}`,
      );
      throw new CounterStrikeExecutableNotFound(game);
    }

    runSteamScriptPath = result[0];
  }

  if (!runSteamScriptPath) {
    logger.error(
      `Cannot find the Steam Linux Runtime script "${steamScriptName}" in the Steam folder at ${steamFolderPath}`,
    );
    throw new CounterStrikeExecutableNotFound(game);
  }

  const scriptExists = await fs.pathExists(scriptPath);
  if (!scriptExists) {
    logger.error(`Cannot find the Counter-Strike script "${scriptPath}"`);
    throw new CounterStrikeExecutableNotFound(game);
  }

  const command =
    game === Game.CS2
      ? `"${runSteamScriptPath}" --verb=waitforexitandrun -- "${scriptPath}"`
      : `"${runSteamScriptPath}" "${scriptPath}"`;

  return buildUnixCommand(command, args, game);
}

function buildWindowsCommand(executablePath: string, args: string) {
  return `"${executablePath}" ${args}`;
}

async function buildCommand(executablePath: string, args: string, game: Game, settings: Settings) {
  if (isWindows) {
    return buildWindowsCommand(executablePath, args);
  }

  if (isLinux) {
    return buildLinuxCommand(executablePath, args, game, settings.playback);
  }

  return buildUnixCommand(executablePath, args, game);
}

// Tip: to understand how Steam starts CS you can use the Steam client launch options: -dev -console
// You would be able to see the command used to start CS in the console.
export async function startCounterStrike(options: StartCounterStrikeOptions) {
  const { demoPath, game, signal, additionalLaunchParameters, fullscreen, mode, map } = options;

  if (game === Game.CS2 && isMac) {
    throw new UnsupportedGame(game);
  }

  await assertSteamIsRunning();

  if (demoPath) {
    assertDemoPathIsValid(demoPath, game);

    try {
      await tryStartingDemoThroughWebSocket(demoPath);
      return;
    } catch {
      // It failed, start CS normally
    }
  }

  const executablePath = await getCounterStrikeExecutablePath(game);
  logger.debug('Found CS executable at:', executablePath);
  const settings = await getSettings();
  const {
    width: userWidth,
    height: userHeight,
    fullscreen: userFullscreen,
    launchParameters: userLaunchParameters,
  } = settings.playback;

  // Tip: the -tools + -noassetbrowser parameters are helpful to debug the CS2 plugin, logs will be available from the VConsole. Windows only!
  const launchParameters = [
    // '-tools',
    // '-noassetbrowser',
    '-insecure',
    '-novid',
  ];
  if (demoPath) {
    launchParameters.push('+playdemo', `"${demoPath}"`);
  } else if (map) {
    launchParameters.push(`+map`, map);
  }
  if (additionalLaunchParameters) {
    launchParameters.push(...additionalLaunchParameters);
  }
  launchParameters.push(userLaunchParameters);
  const width = options.width ?? userWidth;
  launchParameters.push('-width', String(width));
  const height = options.height ?? userHeight;
  launchParameters.push('-height', String(height));
  const enableFullscreen = fullscreen ?? userFullscreen;
  launchParameters.push(enableFullscreen ? '-fullscreen' : '-sw');
  if (mode === 'spectate') {
    const csgoFolderPath = await getCsgoFolderPath();
    if (!csgoFolderPath) {
      throw new CounterStrikeExecutableNotFound(game);
    }
    let cfgFolderPath: string;
    let cfg: string;
    if (game === Game.CSGO) {
      launchParameters.push('+game_type 3', '+game_mode 0', 'forcespec'); // forcespec is our internal parameter to force spectator mode.
      cfgFolderPath = path.join(csgoFolderPath, 'csgo', 'cfg');
      cfg = `
sv_cheats 1
bot_quota 0
cl_draw_only_deathnotices 1
spec_mode 6
echo "CS:DM config loaded"
      `;
    } else {
      launchParameters.push('+game_alias custom');
      cfgFolderPath = path.join(csgoFolderPath, 'game', 'csgo', 'cfg');
      cfg = `
sv_cheats 1
bot_quota 0
cl_draw_only_deathnotices 1
sv_human_autojoin_team 1
cl_hud_telemetry_frametime_show 0
cl_hud_telemetry_net_misdelivery_show 0
cl_hud_telemetry_ping_show 0
cl_hud_telemetry_serverrecvmargin_graph_show 0
cl_trueview_show_status 0
r_show_build_info 0
echo "CS:DM config loaded"
`;
    }
    await fs.writeFile(path.join(cfgFolderPath, 'gamemode_custom_server.cfg'), cfg);
  }

  const args = launchParameters.join(' ');
  const command = await buildCommand(executablePath, args, game, settings);

  throwIfAborted(signal);
  logger.debug('Starting game with command', command);

  options.onGameStart?.();

  const hasBeenKilled = await killCounterStrikeProcesses();
  // When we kill the process it may take a bit of time before the process actually releases files lock.
  // We wait a bit before starting the process again to avoid trying to start CS when it's still running. It would lead
  // to Source Engine error.
  const shouldWait = hasBeenKilled;
  if (shouldWait) {
    await sleep(2000);
  }

  await installCounterStrikeServerPlugin(game);
  defineCfgFolderLocation();

  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now();
    const gameProcess = exec(command, { windowsHide: true });

    const chunks: string[] = [];
    gameProcess.stdout?.on('data', (data: string) => {
      chunks.push(data);
    });

    gameProcess.stderr?.on('data', (data: string) => {
      chunks.push(data);
    });

    gameProcess.on('exit', async (code) => {
      logger.debug('Game process exited with code', code);

      if (demoPath) {
        await deleteJsonActionsFile(demoPath);
      }
      if (options.uninstallPluginOnExit !== false) {
        await uninstallCounterStrikeServerPlugin(game);
      }

      if (signal?.aborted) {
        return reject(abortError);
      }

      const output = chunks.join('\n');
      logger.debug('Game output: \n', output);

      const hasRunLongEnough = Date.now() - startTime >= 2000;
      if (!hasBeenKilled && code !== 0) {
        if (hasRunLongEnough) {
          return reject(new GameError());
        } else {
          logger.error('An error occurred while starting the game');

          if (output.includes('Access is denied')) {
            return reject(new AccessDeniedError());
          }

          return reject(new StartCounterStrikeError(output));
        }
      }

      return resolve();
    });
  });
}
