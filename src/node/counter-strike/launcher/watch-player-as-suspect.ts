import { startCounterStrike } from './start-counter-strike';
import { detectDemoGame } from './detect-demo-game';
import { deletePlaybackFiles } from '../json-actions-file/delete-playback-files';
import { getSettings } from 'csdm/node/settings/get-settings';
import { watchDemoWithHlae } from './watch-demo-with-hlae';

type Options = {
  demoPath: string;
  steamId: string;
  onGameStart: () => void;
};

export async function watchPlayerAsSuspect({ demoPath, steamId, onGameStart }: Options) {
  const game = await detectDemoGame(demoPath);
  await deletePlaybackFiles(demoPath);

  const settings = await getSettings();
  const { useHlae } = settings.playback;
  const launchParameters = [steamId, 'anonsuspect'];

  if (useHlae) {
    await watchDemoWithHlae({
      demoPath,
      game,
      additionalLaunchParameters: launchParameters,
      onGameStart,
    });
  } else {
    await startCounterStrike({
      demoPath,
      game,
      additionalLaunchParameters: launchParameters,
      onGameStart,
    });
  }
}
