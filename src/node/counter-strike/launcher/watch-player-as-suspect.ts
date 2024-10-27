import { startCounterStrike } from './start-counter-strike';
import { detectDemoGame } from './detect-demo-game';
import { deleteJsonActionsFile } from '../json-actions-file/delete-json-actions-file';
import { getSettings } from 'csdm/node/settings/get-settings';
import { watchDemoWithHlae } from './watch-demo-with-hlae';

type Options = {
  demoPath: string;
  steamId: string;
  onGameStart: () => void;
};

export async function watchPlayerAsSuspect({ demoPath, steamId, onGameStart }: Options) {
  const game = await detectDemoGame(demoPath);
  await deleteJsonActionsFile(demoPath);

  const settings = await getSettings();
  const { useHlae } = settings.playback;
  const playDemoArgs = [steamId, 'anonsuspect'];

  if (useHlae) {
    await watchDemoWithHlae({
      demoPath,
      game,
      playDemoArgs,
      onGameStart,
    });
  } else {
    await startCounterStrike({
      demoPath,
      game,
      playDemoArgs,
      onGameStart,
    });
  }
}
