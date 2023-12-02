import { watchPlayerLowlights } from 'csdm/node/counter-strike/launcher/watch-player-lowlights';
import type { Perspective } from 'csdm/common/types/perspective';
import { buildWatchDemoErrorPayload, onGameStart } from './counter-strike';

export type WatchPlayerLowlightsPayload = {
  demoPath: string;
  steamId: string;
  perspective: Perspective;
};

export async function watchPlayerLowlightsHandler(payload: WatchPlayerLowlightsPayload) {
  try {
    await watchPlayerLowlights({
      ...payload,
      onGameStart,
    });
  } catch (error) {
    return buildWatchDemoErrorPayload(error, payload.demoPath, 'Error watching player lowlights');
  }
}
