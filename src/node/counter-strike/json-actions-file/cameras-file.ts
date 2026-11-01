import fs from 'fs-extra';
import type { Game } from 'csdm/common/types/counter-strike';
import { fetchMapCameras } from 'csdm/node/database/cameras/fetch-map-cameras';

export function getCamerasFilePath(demoPath: string) {
  return `${demoPath}.cameras.json`;
}

// The cameras of the demo's map, listed in the camera menu of the playback panel.
export async function writeCamerasFile(demoPath: string, game: Game, mapName: string) {
  // The cameras are optional, a failure here must not stop the demo from starting.
  try {
    const cameras = await fetchMapCameras(game, mapName);
    if (cameras.length === 0) {
      return;
    }

    await fs.writeFile(getCamerasFilePath(demoPath), JSON.stringify(cameras));
  } catch (error) {
    logger.warn(`Failed to write cameras file for demo ${demoPath}`);
    logger.warn(error);
  }
}
