import { watchPlayerHighlights } from 'csdm/node/counter-strike/launcher/watch-player-highlights';
import type { Perspective } from 'csdm/common/types/perspective';
import { handleWatchDemoError, onGameStart } from 'csdm/server/counter-strike';

export type WatchPlayerHighlightsPayload = {
  demoPath: string;
  steamId: string;
  perspective: Perspective;
};

export async function watchPlayerHighlightsHandler(payload: WatchPlayerHighlightsPayload) {
  try {
    await watchPlayerHighlights({
      ...payload,
      onGameStart,
    });
  } catch (error) {
    return handleWatchDemoError(error, payload.demoPath, 'Error watching player highlights');
  }
}
