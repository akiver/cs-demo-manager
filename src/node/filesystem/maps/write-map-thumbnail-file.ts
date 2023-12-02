import path from 'node:path';
import fs from 'node:fs/promises';
import type { Game } from 'csdm/common/types/counter-strike';
import { getUserMapsThumbnailsFolderPath } from 'csdm/node/filesystem/maps/get-user-maps-thumbnails-folder-path';

export async function writeMapThumbnailFileFromBase64(mapName: string, game: Game, base64: string) {
  const userThumbnailsFolderPath = getUserMapsThumbnailsFolderPath(game);
  const thumbnailPath = path.join(userThumbnailsFolderPath, `${mapName}.png`);
  await fs.writeFile(thumbnailPath, base64.replace(/^data:image\/png;base64,/, ''), 'base64');
}
