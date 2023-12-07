import { buildWatchDemoErrorPayload, onGameStart } from './counter-strike';
import { watchPlayerRounds } from 'csdm/node/counter-strike/launcher/watch-player-rounds';

export type WatchPlayerRoundsPayload = {
  demoPath: string;
  steamId: string;
};

export async function watchPlayerRoundsHandler(payload: WatchPlayerRoundsPayload) {
  try {
    await watchPlayerRounds({
      ...payload,
      onGameStart,
    });
  } catch (error) {
    return buildWatchDemoErrorPayload(error, payload.demoPath, 'Error watching player rounds');
  }
}
