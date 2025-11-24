import { watchPlayerRounds } from 'csdm/node/counter-strike/launcher/watch-player-rounds';
import { handleWatchDemoError, onGameStart } from 'csdm/server/counter-strike';

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
    return handleWatchDemoError(error, payload.demoPath, 'Error watching player rounds');
  }
}
