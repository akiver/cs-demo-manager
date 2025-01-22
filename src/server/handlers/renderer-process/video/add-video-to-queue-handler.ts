import { assertVideoGenerationIsPossible } from 'csdm/node/video/generation/assert-video-generation-is-possible';
import { videoQueue } from 'csdm/server/video-queue';
import type { AddVideoPayload } from 'csdm/common/types/video';
import { handleError } from '../../handle-error';

export async function addVideoToQueueHandler(payload: AddVideoPayload) {
  try {
    await assertVideoGenerationIsPossible(payload);
    videoQueue.addVideo(payload);
  } catch (error) {
    handleError(error, 'Error while adding video to queue');
  }
}
