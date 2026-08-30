import type { Video } from 'csdm/common/types/video';
import { videoQueue } from 'csdm/server/video-queue';

export type VideoQueueState = {
  videos: Video[];
  isPaused: boolean;
};

export async function getVideoQueueHandler(): Promise<VideoQueueState> {
  return Promise.resolve({
    videos: videoQueue.getVideos(),
    isPaused: videoQueue.getIsPaused(),
  });
}
