import { capturePlayerView } from 'csdm/node/counter-strike/launcher/capture-player-view';
import { handleError } from '../../handle-error';
import type { Game } from 'csdm/common/types/counter-strike';

export async function capturePlayerViewHandler(game: Game) {
  try {
    return await capturePlayerView(game);
  } catch (error) {
    return handleError(error, 'Error while capturing player view');
  }
}
