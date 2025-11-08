import type { WatchVideoSequencesPayload } from 'csdm/common/types/video';
import { handleError } from '../../handle-error';
import { watchVideoSequences } from 'csdm/node/video/generation/watch-video-sequences';

export async function watchVideoSequencesHandler(payload: WatchVideoSequencesPayload) {
  try {
    await watchVideoSequences(payload);
  } catch (error) {
    handleError(error, 'Error while watching video sequences');
  }
}
