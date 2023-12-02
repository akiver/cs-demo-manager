import { watchPlayerAsSuspect } from 'csdm/node/counter-strike/launcher/watch-player-as-suspect';
import { buildWatchDemoErrorPayload, onGameStart } from './counter-strike';

export type WatchPlayerAsSuspectPayload = {
  demoPath: string;
  steamId: string;
};

export async function watchPlayerAsSuspectHandler(payload: WatchPlayerAsSuspectPayload) {
  try {
    await watchPlayerAsSuspect({
      ...payload,
      onGameStart,
    });
  } catch (error) {
    return buildWatchDemoErrorPayload(error, payload.demoPath, 'Error watching player as suspect');
  }
}
