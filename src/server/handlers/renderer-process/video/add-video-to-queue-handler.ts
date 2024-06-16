import { ErrorCode } from 'csdm/common/error-code';
import { assertVideoGenerationIsPossible } from 'csdm/node/video/assert-video-generation-is-possible';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { videoQueue } from 'csdm/server/video-queue';
import type { AddVideoPayload } from 'csdm/common/types/video';

export async function addVideoToQueueHandler(payload: AddVideoPayload) {
  try {
    await assertVideoGenerationIsPossible(payload);
    videoQueue.addVideo(payload);
  } catch (error) {
    const errorCode = getErrorCodeFromError(error);
    if (errorCode === ErrorCode.UnknownError) {
      logger.error('Error while adding video to queue');
      logger.error(error);
    }

    throw errorCode;
  }
}
