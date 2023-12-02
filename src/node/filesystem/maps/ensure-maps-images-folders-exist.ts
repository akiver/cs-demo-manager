import fs from 'fs-extra';
import { Game } from 'csdm/common/types/counter-strike';
import { getUserMapsRadarsFolderPath } from 'csdm/node/filesystem/maps/get-user-maps-radars-folder-path';
import { getUserMapsThumbnailsFolderPath } from 'csdm/node/filesystem/maps/get-user-maps-thumbnails-folder-path';

export async function ensureMapImagesFoldersExist() {
  await Promise.all([
    fs.ensureDir(getUserMapsRadarsFolderPath(Game.CSGO)),
    fs.ensureDir(getUserMapsThumbnailsFolderPath(Game.CSGO)),
    fs.ensureDir(getUserMapsRadarsFolderPath(Game.CS2)),
    fs.ensureDir(getUserMapsThumbnailsFolderPath(Game.CS2)),
  ]);
}
