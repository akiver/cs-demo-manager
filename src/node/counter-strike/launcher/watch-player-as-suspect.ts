import { Game } from 'csdm/common/types/counter-strike';
import { startCounterStrike } from './start-counter-strike';
import { deleteVdmFile } from './delete-vdm-file';
import { detectDemoGame } from './detect-demo-game';
import { deleteJsonActionsFile } from '../json-actions-file/delete-json-actions-file';
import { isMac } from 'csdm/node/os/is-mac';

type Options = {
  demoPath: string;
  steamId: string;
  onGameStart: () => void;
};

export async function watchPlayerAsSuspect({ demoPath, steamId, onGameStart }: Options) {
  const game = await detectDemoGame(demoPath);
  if (game === Game.CSGO) {
    await deleteVdmFile(demoPath);
  } else if (!isMac) {
    await deleteJsonActionsFile(demoPath);
  }

  // TODO CS2 Re-enable it in the UI if CS2 support the anonsuspect argument one day
  await startCounterStrike({
    demoPath,
    game,
    additionalArguments: [steamId, 'anonsuspect'],
    onGameStart,
  });
}
