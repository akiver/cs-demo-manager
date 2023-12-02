import { watchDemo } from 'csdm/node/counter-strike/launcher/watch-demo';
import { buildWatchDemoErrorPayload, onGameStart } from './counter-strike';

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
    return buildWatchDemoErrorPayload(error, payload.demoPath, 'Error watching demo');
  }
}
