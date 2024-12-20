import { exec } from 'node:child_process';
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

type StartCounterStrikeOptions = {
  demoPath: string;
  game: Game;
  width?: number;
  height?: number;
  fullscreen?: boolean;
  playDemoArgs?: string[];
  uninstallPluginOnExit?: boolean;
  signal?: AbortSignal;
  onGameStart: () => void;
};

export async function startCounterStrike(options: StartCounterStrikeOptions) {
  const { demoPath, game, signal, playDemoArgs, fullscreen } = options;

  if (game === Game.CS2 && isMac) {
    throw new UnsupportedGame(game);
  }

  await assertSteamIsRunning();

  assertDemoPathIsValid(demoPath, game);

  const playbackStarted = await tryStartingDemoThroughWebSocket(demoPath);
  if (playbackStarted) {
    return;
  }

  const executablePath = await getCounterStrikeExecutablePath(game);
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
    '+playdemo',
    `"${demoPath}"`,
  ];
  if (playDemoArgs) {
    launchParameters.push(...playDemoArgs);
  }
  launchParameters.push(userLaunchParameters);
  const width = options.width ?? userWidth;
  launchParameters.push('-width', String(width));
  const height = options.height ?? userHeight;
  launchParameters.push('-height', String(height));
  const enableFullscreen = fullscreen ?? userFullscreen;
  launchParameters.push(enableFullscreen ? '-fullscreen' : '-sw');

  let command: string;
  const args = launchParameters.join(' ');
  if (isWindows) {
    command = `"${executablePath}" ${args}`;
  } else {
    if (game === Game.CSGO) {
      command = `${executablePath} --args ${args}`;
    } else {
      command = `${executablePath} ${args}`;
    }
  }

  throwIfAborted(signal);
  logger.log('Starting game with command', command);

  options.onGameStart();

  const hasBeenKilled = await killCounterStrikeProcesses();
  // When we kill the process on Unix it may take a bit of time before the process actually releases files lock.
  // We wait a bit before starting the process again to avoid trying to start CS when it's still running. It would lead
  // to Source Engine error.
  const shouldWait = hasBeenKilled && !isWindows;
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

    gameProcess.on('exit', (code) => {
      logger.log('Game process exited with code', code);

      deleteJsonActionsFile(demoPath);
      if (options.uninstallPluginOnExit !== false) {
        uninstallCounterStrikeServerPlugin(game);
      }

      if (signal?.aborted) {
        return reject(abortError);
      }

      const output = chunks.join('\n');
      logger.log('Game output: \n', output);

      const hasRunLongEnough = Date.now() - startTime >= 2000;
      if (code !== 0) {
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
