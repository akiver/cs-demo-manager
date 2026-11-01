import fs from 'fs-extra';
import { Game } from 'csdm/common/types/counter-strike';
import { getDemoHeader } from 'csdm/node/demo/get-demo-header';
import { getDemoChecksumFromFileStats } from 'csdm/node/demo/get-demo-checksum-from-file-stats';
import { getDemoMapNameFromHeader } from 'csdm/node/demo/get-demo-from-file-path';
import { writeTimelineFile } from './timeline-file';
import { writeCamerasFile } from './cameras-file';

export async function writePlaybackFiles(demoPath: string, game: Game) {
  if (game === Game.CSGO) {
    return;
  }

  // Both files are optional, a failure here must not stop the demo from starting.
  let checksum: string;
  let mapName: string;
  try {
    const [header, stats] = await Promise.all([getDemoHeader(demoPath), fs.stat(demoPath)]);
    checksum = getDemoChecksumFromFileStats(header, stats);
    mapName = getDemoMapNameFromHeader(header);
  } catch (error) {
    logger.warn(`Failed to read demo header for playback files of demo ${demoPath}`);
    logger.warn(error);
    return;
  }

  await Promise.all([writeTimelineFile(demoPath, checksum), writeCamerasFile(demoPath, game, mapName)]);
}
