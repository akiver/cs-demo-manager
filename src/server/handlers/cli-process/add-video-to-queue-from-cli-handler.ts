import type { AddVideoPayload, Video } from 'csdm/common/types/video';
import { assertVideoGenerationIsPossible } from 'csdm/node/video/generation/assert-video-generation-is-possible';
import { videoQueue } from 'csdm/server/video-queue';
import { ensureDatabaseConnection } from 'csdm/server/ensure-database-connection';
import { handleError } from '../handle-error';

export async function addVideoToQueueFromCliHandler(payload: AddVideoPayload): Promise<Video> {
  try {
    // Processing a video requires database reads (cameras, players slots…), make sure the connection exists when the
    // daemon has been spawned by the CLI.
    await ensureDatabaseConnection();
    await assertVideoGenerationIsPossible(payload);

    return videoQueue.addVideo(payload);
  } catch (error) {
    return handleError(error, 'Error while adding video to queue from CLI');
  }
}
