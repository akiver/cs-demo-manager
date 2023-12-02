import { watchPlayerHighlights } from 'csdm/node/counter-strike/launcher/watch-player-highlights';
import type { Perspective } from 'csdm/common/types/perspective';
import { buildWatchDemoErrorPayload, onGameStart } from './counter-strike';

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
    return buildWatchDemoErrorPayload(error, payload.demoPath, 'Error watching player highlights');
  }
}
