import { watchDemo } from 'csdm/node/counter-strike/launcher/watch-demo';
import { handleWatchDemoError, onGameStart } from 'csdm/server/counter-strike';

export type WatchDemoPayload = {
  demoPath: string;
  focusSteamId?: string;
  startTick?: number;
  additionalArguments?: string[];
};

export async function watchDemoHandler(payload: WatchDemoPayload) {
  try {
    await watchDemo({
      ...payload,
      onGameStart,
    });
  } catch (error) {
    return handleWatchDemoError(error, payload.demoPath, 'Error watching demo');
  }
}
