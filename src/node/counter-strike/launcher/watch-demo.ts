import { startCounterStrike } from './start-counter-strike';
import { JSONActionsFileGenerator } from '../json-actions-file/json-actions-file-generator';
import { detectDemoGame } from './detect-demo-game';
import { deleteJsonActionsFile } from '../json-actions-file/delete-json-actions-file';
import { getSettings } from 'csdm/node/settings/get-settings';
import { watchDemoWithHlae } from './watch-demo-with-hlae';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { fetchMatchPlayersSlots } from 'csdm/node/database/match/fetch-match-players-slots';
import type { Game } from 'csdm/common/types/counter-strike';

async function generateJsonActionsFile(
  demoPath: string,
  game: Game,
  playerVoicesEnabled: boolean,
  startTick?: number,
  steamId?: string,
) {
  const json = new JSONActionsFileGenerator(demoPath, game);

  if (playerVoicesEnabled) {
    json.enablePlayerVoices();
  } else {
    json.disablePlayerVoices();
  }

  if (startTick) {
    json.addSkipAhead(0, startTick);
  }

  if (steamId !== undefined) {
    const checksum = await getDemoChecksumFromDemoPath(demoPath);
    const slots = await fetchMatchPlayersSlots(checksum);
    const slot = slots[steamId];
    if (slot) {
      json.addSpecPlayer(startTick ?? 0, slot);
    }
  }

  await json.write();
}

type Options = {
  demoPath: string;
  width?: number;
  height?: number;
  fullscreen?: boolean;
  focusSteamId?: string;
  startTick?: number;
  additionalArguments?: string[];
  onGameStart: () => void;
};

export async function watchDemo(options: Options) {
  const { demoPath, startTick, focusSteamId } = options;
  const game = await detectDemoGame(demoPath);
  const settings = await getSettings();
  const { playerVoicesEnabled, useHlae } = settings.playback;

  await deleteJsonActionsFile(demoPath);
  await generateJsonActionsFile(demoPath, game, playerVoicesEnabled, startTick, focusSteamId);

  if (useHlae) {
    await watchDemoWithHlae({
      ...options,
      game,
    });
  } else {
    await startCounterStrike({
      ...options,
      game,
    });
  }
}
