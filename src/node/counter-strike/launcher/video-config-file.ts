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
};

type CS2VideoConfig = {
  'video.cfg': Fields;
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

async function enableFullscreenWindowedForCSGO() {
  // The CS:GO video config file is located in the CS:DM config folder because we set the USRLOCALCSGO env var when
  // launching CS:GO (see define-cfg-folder-location.ts).
  // ! Both video.txt and videodefaults.txt need to be edited otherwise the game starts in windowed mode.
  const cfgFolderPath = path.join(getCfgFolderLocation(), 'cfg');
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

    // ! both fullscreen and nowindowborder need to be enabled for fullscreen windowed mode
    config[key]['setting.fullscreen'] = '1';
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

async function enableFullscreenWindowedForCS2() {
  // The env var USRLOCALCSGO that allows to redirect where config files are saved does not work for CS2.
  // Therefore, we need to find all CS2 video config files located in the Steam folder and edit them (there may be
  // several Steam accounts installed on the machine).
  // We create a backup before editing them and restore them a few seconds after the game is launched or when it is
  // closed.
  const videoConfigFiles = await findFilesInSteamFolder('**/cs2_video.txt');
  if (videoConfigFiles.length === 0) {
    throw new CounterStrikeVideoConfigNotFound();
  }

  for (const file of videoConfigFiles) {
    await fs.copyFile(file, `${file}.csdm`);

    const content = await fs.readFile(file, 'utf8');
    const config = VDF.parse<CS2VideoConfig>(content);
    config['video.cfg']['setting.fullscreen'] = '0';
    config['video.cfg']['setting.nowindowborder'] = '1';

    const text = VDF.stringify(config, true);
    await fs.writeFile(file, text);
    logger.debug(`Generated CS2 video config file ${file}`);
    logger.debug(text);
  }
}

// Edits the CS video config file to enable fullscreen windowed mode (there is no launch parameter for that).
// This function needs to be called before launching the game.
//
// The config file is a VDF file and the 2 important fields are 'setting.fullscreen' and 'setting.nowindowborder'.
// The screen resolution fields, 'setting.defaultres' and 'setting.defaultresheight' have no impact, we must set them
// through launch parameters (-width and -height).
export async function enableFullscreenWindowed(game: Game) {
  if (game === Game.CSGO) {
    return await enableFullscreenWindowedForCSGO();
  }

  await enableFullscreenWindowedForCS2();
}

export async function restoreVideoConfigFiles() {
  const backupFiles = await findFilesInSteamFolder('**/cs2_video.txt.csdm');

  for (const file of backupFiles) {
    const originalFile = file.replace(/\.csdm$/, '');
    await fs.copyFile(file, originalFile);
    await fs.remove(file);
    logger.debug(`Restored video config file from backup ${originalFile}`);
  }
}
