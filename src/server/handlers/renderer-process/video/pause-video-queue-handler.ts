import { videoQueue } from 'csdm/server/video-queue';

export async function pauseVideoQueueHandler() {
  videoQueue.pause();

  return Promise.resolve();
}
