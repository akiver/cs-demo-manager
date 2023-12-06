import { exec } from 'node:child_process';
import path from 'node:path';
import { Game } from 'csdm/common/types/counter-strike';
import { isWindows } from 'csdm/node/os/is-windows';
import { getSettings } from 'csdm/node/settings/get-settings';
import { HlaeError } from './errors/hlae-error';
import { killCounterStrikeProcesses } from '../kill-counter-strike-processes';
import { isCounterStrikeRunning } from 'csdm/node/counter-strike/is-counter-strike-running';
import { abortError } from 'csdm/node/errors/abort-error';
import { getCounterStrikeExecutablePath } from '../get-counter-strike-executable-path';
import { installCs2ServerPlugin } from './cs2-server-plugin';
import { assertDemoPathIsValid } from './assert-demo-path-is-valid';
import { sleep } from 'csdm/common/sleep';
import { defineCfgFolderLocation } from './define-cfg-folder-location';

export type HlaeOptions = {
  demoPath: string;
  game: Game;
  width?: number;
  height?: number;
  hlaeExecutablePath: string;
  csgoLaunchOptions?: string;
  signal: AbortSignal;
  onGameExit: () => void;
};

async function waitForCounterStrikeExit() {
  const checkIntervalInMs = 10_000;

  return new Promise<void>((resolve) => {
    const intervalId = setInterval(async () => {
      const isCsRunning = await isCounterStrikeRunning();
      if (!isCsRunning) {
        clearInterval(intervalId);
        resolve();
      }
    }, checkIntervalInMs);
  });
}

async function startHlae(command: string, onGameExit: () => void, signal: AbortSignal) {
  logger.log('Starting HLAE with command', command);

  return new Promise<void>((resolve, reject) => {
    const hlaeProcess = exec(command, { windowsHide: true }, (error, stdout, stderr) => {
      if (signal.aborted) {
        return;
      }

      if (stdout) {
        logger.log('HLAE stdout:', stdout);
      }
      if (stderr) {
        logger.log('HLAE stderr:', stderr);
      }
    });

    hlaeProcess.on('exit', async (code) => {
      logger.log('HLAE exited with code', code);

      if (signal.aborted) {
        return reject(abortError);
      }

      if (code !== 0) {
        return reject(new HlaeError());
      }

      await waitForCounterStrikeExit();
      onGameExit();

      return resolve();
    });
  });
}

export async function watchDemoWithHlae({
  demoPath,
  game,
  hlaeExecutablePath,
  csgoLaunchOptions,
  width,
  height,
  signal,
  onGameExit,
}: HlaeOptions) {
  if (!isWindows) {
    throw new Error('HLAE is available only on Windows');
  }

  if (game === Game.CSGO) {
    assertDemoPathIsValid(demoPath);
  }

  const csHasBeenKilled = await killCounterStrikeProcesses();
  const csExecutablePath = await getCounterStrikeExecutablePath(game);

  const hlaeParameters: string[] = ['-noGui', '-autoStart'];
  const launchOptions = ['-insecure', '-novid', '-sw', '+playdemo', `\\"${demoPath}\\"`];
  if (width) {
    launchOptions.push('-width', String(width));
  }
  if (height) {
    launchOptions.push('-height', String(height));
  }
  if (csgoLaunchOptions !== undefined) {
    launchOptions.push(csgoLaunchOptions);
  }

  if (game !== Game.CSGO) {
    hlaeParameters.push(
      '-customLoader',
      `-hookDllPath "${path.join(path.dirname(hlaeExecutablePath), 'x64', 'AfxHookSource2.dll')}"`,
      `-programPath "${csExecutablePath}"`,
      `-cmdLine "${launchOptions.join(' ')}"`,
    );
    if (csHasBeenKilled) {
      // Wait a few seconds before installing the plugin as its files may still be locked by CS2
      await sleep(2000);
    }
    defineCfgFolderLocation();
    await installCs2ServerPlugin();
  } else {
    hlaeParameters.push(
      '-csgoLauncher',
      `-csgoExe "${csExecutablePath}"`,
      `-customLaunchOptions "${launchOptions.join(' ')}"`,
    );
  }

  const settings = await getSettings();
  const { configFolderEnabled, configFolderPath, parameters } = settings.video.hlae;
  if (configFolderEnabled && configFolderPath !== '') {
    hlaeParameters.push('-mmcfgEnabled true', `-mmcfg "${configFolderPath}"`);
  }

  if (typeof parameters === 'string') {
    hlaeParameters.push(parameters);
  }

  const command = `"${hlaeExecutablePath}" ${hlaeParameters.join(' ')}`;

  await startHlae(command, onGameExit, signal);
}
