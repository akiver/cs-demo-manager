import type { AddVideoPayload, Video } from 'csdm/common/types/video';
import type { HandlerContext } from 'csdm/server/messages/handler';
import { assertVideoGenerationIsPossible } from 'csdm/node/video/generation/assert-video-generation-is-possible';
import { videoQueue } from 'csdm/server/video-queue';
import { ensureDatabaseConnection } from 'csdm/server/ensure-database-connection';
import { handleError } from '../handle-error';

export async function addVideoToQueueFromCliHandler(
  payload: AddVideoPayload,
  context?: HandlerContext,
): Promise<Video> {
  try {
    await ensureDatabaseConnection();
    await assertVideoGenerationIsPossible(payload);

    return videoQueue.addVideo(payload, context?.clientId);
  } catch (error) {
    return handleError(error, 'Error while adding video to queue from CLI');
  }
}
