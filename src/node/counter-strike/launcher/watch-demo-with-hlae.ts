import { exec } from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';
import { Game } from 'csdm/common/types/counter-strike';
import { isWindows } from 'csdm/node/os/is-windows';
import { getSettings } from 'csdm/node/settings/get-settings';
import { HlaeError } from './errors/hlae-error';
import { killCounterStrikeProcesses } from '../kill-counter-strike-processes';
import { isCounterStrikeRunning } from 'csdm/node/counter-strike/is-counter-strike-running';
import { abortError } from 'csdm/node/errors/abort-error';
import { getCounterStrikeExecutablePath } from '../get-counter-strike-executable-path';
import { assertDemoPathIsValid } from './assert-demo-path-is-valid';
import { defineCfgFolderLocation } from './define-cfg-folder-location';
import { getHlaeExecutablePathOrThrow } from 'csdm/node/video/hlae/hlae-location';
import { getRunningProcessExitCode } from 'csdm/node/os/get-running-process-exit-code/get-running-process-exit-code';
import { sleep } from 'csdm/common/sleep';
import { GameError } from './errors/game-error';
import { installCounterStrikeServerPlugin, uninstallCounterStrikeServerPlugin } from './cs-server-plugin';
import { getFfmpegExecutablePath } from 'csdm/node/video/ffmpeg/ffmpeg-location';
import { FfmpegNotInstalled } from 'csdm/node/video/errors/ffmpeg-not-installed';

type HlaeOptions = {
  demoPath: string;
  game: Game;
  fullscreen?: boolean;
  width?: number;
  height?: number;
  playDemoArgs?: string[];
  hlaeParameters?: string;
  signal?: AbortSignal;
  onGameStart?: () => void;
  uninstallPluginOnExit?: boolean;
  registerFfmpegLocation?: boolean; // Should we write the ffmpeg.ini file that indicates the location of the FFmpeg executable?
};

// Creates the ffmpeg.ini file that indicates the location of the FFmpeg executable.
// The file must be inside the ffmpeg folder next to the HLAE executable. Example:
// C:/Users/username/hlae/ffmpeg/ffmpeg.ini
async function registerFfmpegLocation(hlaeExecutablePath: string) {
  const ffmpegExecutablePath = await getFfmpegExecutablePath();
  if (!(await fs.pathExists(ffmpegExecutablePath))) {
    throw new FfmpegNotInstalled();
  }

  const ffmpegFolderPath = path.resolve(path.dirname(hlaeExecutablePath), 'ffmpeg');
  await fs.ensureDir(ffmpegFolderPath);
  const iniFilePath = path.resolve(ffmpegFolderPath, 'ffmpeg.ini');
  await fs.writeFile(iniFilePath, `[Ffmpeg]\nPath=${ffmpegExecutablePath}`, 'utf-8');
}

function getGameProcessName(game: Game) {
  return game === Game.CSGO ? 'csgo.exe' : 'cs2.exe';
}

async function isHlaeErrorWindowExists(game: Game) {
  return new Promise<boolean>((resolve) => {
    return exec(
      `tasklist /fi "imagename eq ${getGameProcessName(game)}" /v /nh`,
      { windowsHide: true },
      (err, stdout) => {
        return resolve(stdout.includes('Error - AfxHookSource'));
      },
    );
  });
}

type StartHlaeOptions = {
  command: string;
  signal?: AbortSignal;
  game: Game;
};

async function startHlae({ command, signal, game }: StartHlaeOptions) {
  logger.log('Starting HLAE with command', command);

  return new Promise<void>((resolve, reject) => {
    const hlaeProcess = exec(command, { windowsHide: true }, (error, stdout, stderr) => {
      if (signal?.aborted) {
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

      if (signal?.aborted) {
        return reject(abortError);
      }

      if (code !== 0) {
        return reject(new HlaeError());
      }

      await sleep(2_000);
      const hlaeErrorDetected = await isHlaeErrorWindowExists(game);
      if (hlaeErrorDetected) {
        return reject(new HlaeError());
      }

      const isCsRunning = await isCounterStrikeRunning();
      if (!isCsRunning) {
        return reject(new GameError());
      }

      const processName = getGameProcessName(game);

      try {
        const exitCode = await getRunningProcessExitCode(processName);
        if (exitCode === 0) {
          return resolve();
        }

        return reject(new GameError());
      } catch (error) {
        logger.error(`Failed to get ${processName} exit code`);
        logger.error(error);
        return reject(error);
      }
    });
  });
}

export async function watchDemoWithHlae(options: HlaeOptions) {
  if (!isWindows) {
    throw new Error('HLAE is available only on Windows');
  }

  const { demoPath, game, signal } = options;
  assertDemoPathIsValid(demoPath, game);

  const hlaeExecutablePath = await getHlaeExecutablePathOrThrow();
  await killCounterStrikeProcesses();
  const csExecutablePath = await getCounterStrikeExecutablePath(game);
  const settings = await getSettings();
  const {
    width: userWidth,
    height: userHeight,
    fullscreen: userFullscreen,
    launchParameters: userLaunchParameters,
  } = settings.playback;

  const gameParameters = ['-insecure', '-novid', '+playdemo', `\\"${demoPath}\\"`];
  if (Array.isArray(options.playDemoArgs)) {
    gameParameters.push(...options.playDemoArgs);
  }
  const width = options.width ?? userWidth;
  gameParameters.push('-width', String(width));
  const height = options.height ?? userHeight;
  gameParameters.push('-height', String(height));
  const enableFullscreen = options.fullscreen ?? userFullscreen;
  gameParameters.push(enableFullscreen ? '-fullscreen' : '-sw');
  if (typeof userLaunchParameters === 'string' && userLaunchParameters !== '') {
    gameParameters.push(userLaunchParameters);
  }

  const hlaeParameters = ['-noGui', '-autoStart', '-noConfig', '-afxDisableSteamStorage'];
  const { configFolderEnabled, configFolderPath, parameters: userHlaeParameters } = settings.video.hlae;
  if (configFolderEnabled && configFolderPath !== '') {
    hlaeParameters.push('-mmcfgEnabled true', `-mmcfg "${configFolderPath}"`);
  }

  if (game === Game.CSGO) {
    hlaeParameters.push(
      '-csgoLauncher',
      `-csgoExe "${csExecutablePath}"`,
      `-customLaunchOptions "${gameParameters.join(' ')}"`,
    );
  } else {
    hlaeParameters.push(
      '-customLoader',
      `-hookDllPath "${path.join(path.dirname(hlaeExecutablePath), 'x64', 'AfxHookSource2.dll')}"`,
      `-programPath "${csExecutablePath}"`,
      `-cmdLine "${gameParameters.join(' ')}"`,
    );
  }

  await installCounterStrikeServerPlugin(game);
  defineCfgFolderLocation();
  if (options.registerFfmpegLocation) {
    await registerFfmpegLocation(hlaeExecutablePath);
  }

  const parameters = options.hlaeParameters ?? userHlaeParameters;
  if (typeof parameters === 'string' && parameters !== '') {
    hlaeParameters.push(parameters);
  }

  const command = `"${hlaeExecutablePath}" ${hlaeParameters.join(' ')}`;

  options.onGameStart?.();
  await startHlae({
    command,
    signal,
    game,
  });
  if (options.uninstallPluginOnExit !== false) {
    await uninstallCounterStrikeServerPlugin(game);
  }
}
