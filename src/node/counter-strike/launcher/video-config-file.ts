import { isLinux } from 'csdm/node/os/is-linux';
import path from 'node:path';
import { getSteamFolderPath } from '../get-steam-folder-path';
import { glob } from 'csdm/node/filesystem/glob';
import fs from 'fs-extra';
import VDF from 'vdf-parser';
import { Game } from 'csdm/common/types/counter-strike';
import { getCfgFolderLocation } from './define-cfg-folder-location';
import { CounterStrikeVideoConfigNotFound } from './errors/video-config-file-not-found';

type Fields = {
  'setting.fullscreen': string;
  'setting.nowindowborder': string;
  'setting.defaultres': string;
  'setting.defaultresheight': string;
};

type CS2Fields = Fields & {
  'setting.coop_fullscreen': string;
};

type CS2VideoConfig = {
  'video.cfg': CS2Fields;
};

type CSGOVideoConfig = {
  // The key may be 'config' or 'VideoConfig', the latter is used when editing video settings from the in-game menu.
  config: Fields;
  VideoConfig: Fields;
};

async function findFilesInSteamFolder(pattern: string) {
  const steamFolderPath = await getSteamFolderPath();
  if (!steamFolderPath) {
    return [];
  }

  const rootSteamPath = isLinux ? path.join(steamFolderPath, '..') : steamFolderPath;
  const files = await glob(pattern, {
    cwd: rootSteamPath,
    absolute: true,
    onlyFiles: true,
    followSymbolicLinks: false,
  });

  return files;
}

type EnableFullscreenWindowedOptions = {
  game: Game;
  width: number; // CS2 only
  height: number; // CS2 only
  cfgFolderPath?: string; // If defined, the config will be created in that folder instead of the default CS:DM config folder.
};

/**
 * Unlike CS2, CS:GO doesn't allow to define the screen resolution in fullscreen-windowed mode on Windows, even the
 * in-game video settings menu doesn't allow that. The game will always use the monitor resolution in that mode.
 */
async function enableFullscreenWindowedForCSGO(options: EnableFullscreenWindowedOptions) {
  // ! Both video.txt and videodefaults.txt need to be edited otherwise the game starts in windowed mode.
  const cfgFolderPath = options.cfgFolderPath ?? path.join(getCfgFolderLocation(), 'cfg');
  const videoConfigFile = path.join(cfgFolderPath, 'video.txt');
  let config: CSGOVideoConfig = {} as CSGOVideoConfig;
  if (await fs.pathExists(videoConfigFile)) {
    const content = await fs.readFile(videoConfigFile, 'utf8');
    config = VDF.parse<CSGOVideoConfig>(content);
  }

  const keys = ['config', 'VideoConfig'] as const;
  for (const key of keys) {
    if (!config[key]) {
      config[key] = {} as Fields;
    }

    // ! on Linux, both fullscreen and nowindowborder need to be enabled
    config[key]['setting.fullscreen'] = isLinux ? '1' : '0';
    config[key]['setting.nowindowborder'] = '1';
  }

  const text = VDF.stringify(config, {
    pretty: true,
    indent: '\t',
  });

  const defaultsConfigFile = path.join(cfgFolderPath, 'videodefaults.txt');
  await Promise.all([fs.ensureFile(videoConfigFile), fs.ensureFile(defaultsConfigFile)]);
  await Promise.all([fs.writeFile(videoConfigFile, text), fs.writeFile(defaultsConfigFile, text)]);
  logger.debug(`Generated CSGO video config file ${videoConfigFile}`);
  logger.debug(text);
}

/**
 * A full (not partial) video config file needs to be created to apply video settings for CS2.
 * We use the most recently modified cs2_video.txt file found in the Steam folder as a base to create the new config file.
 *
 * ! The screen resolution must be set in the config file and not through launch parameters otherwise the game starts in
 * windowed mode.
 */
async function enableFullscreenWindowedForCS2(options: EnableFullscreenWindowedOptions) {
  const videoConfigFiles = await findFilesInSteamFolder('**/cs2_video.txt');
  if (videoConfigFiles.length === 0) {
    throw new CounterStrikeVideoConfigNotFound();
  }

  // sort files by modification date, most recent first
  videoConfigFiles.sort((fileA, fileB) => {
    return fs.statSync(fileB).mtime.getTime() - fs.statSync(fileA).mtime.getTime();
  });

  const cfgFolderPath = options.cfgFolderPath ?? path.join(getCfgFolderLocation(), 'cfg');
  const videoConfigFile = path.join(cfgFolderPath, 'cs2_video.txt');
  const mostRecentVideoConfigFile = videoConfigFiles[0];
  const content = await fs.readFile(mostRecentVideoConfigFile, 'utf8');
  const config = VDF.parse<CS2VideoConfig>(content);

  config['video.cfg']['setting.fullscreen'] = '0';
  config['video.cfg']['setting.nowindowborder'] = '1';
  config['video.cfg']['setting.coop_fullscreen'] = '1';
  config['video.cfg']['setting.defaultres'] = String(options.width);
  config['video.cfg']['setting.defaultresheight'] = String(options.height);

  const text = VDF.stringify(config, true);
  await fs.ensureFile(videoConfigFile);
  await fs.writeFile(videoConfigFile, text);
  logger.debug(`Generated CS2 video config file ${videoConfigFile}`);
  logger.debug(text);
}

/**
 * Edits the CS video config file to enable fullscreen windowed mode (there is no game launch parameter for that).
 * This function needs to be called before launching the game!
 *
 * By default, it assumes that the video config file is located in the CS:DM config folder.
 * If defineCfgFolderLocation() was called with a custom path, that path must be provided here through the options.
 * See the startCounterStrikeWithHlae() function for an example.
 */
export async function enableFullscreenWindowed(options: EnableFullscreenWindowedOptions) {
  if (options.game === Game.CSGO) {
    return await enableFullscreenWindowedForCSGO(options);
  }

  await enableFullscreenWindowedForCS2(options);
}
