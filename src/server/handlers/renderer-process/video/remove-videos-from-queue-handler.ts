import { videoQueue } from 'csdm/server/video-queue';

export async function removeVideosFromQueueHandler(videoIds: string[]) {
  videoQueue.removeVideos(videoIds);

  return Promise.resolve();
}
