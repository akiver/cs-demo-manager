import { db } from '../database';

type PlaybackData = {
  tickCount: number;
  tickRate: number;
  frameRate: number;
  duration: number;
};
export async function updateDemoPlaybackValues(checksum: string, playbackData: PlaybackData) {
  await db
    .updateTable('demos')
    .set({
      tick_count: playbackData.tickCount,
      tickrate: playbackData.tickRate,
      framerate: playbackData.frameRate,
      duration: playbackData.duration,
    })
    .where('checksum', '=', checksum)
    .execute();
}
