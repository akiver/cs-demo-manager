import { videoQueue } from 'csdm/server/video-queue';

export async function resumeVideoQueueHandler() {
  videoQueue.resume();

  return Promise.resolve();
}
