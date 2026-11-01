import { startCounterStrike } from './start-counter-strike';
import { JSONActionsFileGenerator } from '../json-actions-file/json-actions-file-generator';
import { detectDemoGame } from './detect-demo-game';
import { deletePlaybackFiles } from '../json-actions-file/delete-playback-files';
import { getSettings } from 'csdm/node/settings/get-settings';
import { watchDemoWithHlae } from './watch-demo-with-hlae';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { fetchMatchPlayersSlots } from 'csdm/node/database/match/fetch-match-players-slots';
import type { Game } from 'csdm/common/types/counter-strike';

// Console command executed by the plugin when the playback reaches the tick.
export type TickCommand = {
  tick: number;
  cmd: string;
};

async function generateJsonActionsFile(
  demoPath: string,
  game: Game,
  playerVoicesEnabled: boolean,
  startTick?: number,
  steamId?: string,
  commands: TickCommand[] = [],
) {
  const json = new JSONActionsFileGenerator(demoPath, game);

  if (playerVoicesEnabled) {
    json.enablePlayerVoices();
  } else {
    json.disablePlayerVoices();
  }

  if (startTick) {
    json.addGoToTick(0, startTick);
  }

  if (steamId) {
    const checksum = await getDemoChecksumFromDemoPath(demoPath);
    const players = await fetchMatchPlayersSlots(checksum);
    const player = players.find((player) => player.steamId === steamId);
    if (player) {
      json.addSpecPlayer(startTick ?? 0, player.slot);
    }
  }

  for (const { tick, cmd } of commands) {
    json.addExecCommand(tick, cmd);
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
  commands?: TickCommand[];
  onGameStart: () => void;
};

export async function watchDemo(options: Options) {
  const { demoPath, startTick, focusSteamId, commands } = options;
  const game = await detectDemoGame(demoPath);
  const settings = await getSettings();
  const { playerVoicesEnabled, useHlae } = settings.playback;

  await deletePlaybackFiles(demoPath);
  await generateJsonActionsFile(demoPath, game, playerVoicesEnabled, startTick, focusSteamId, commands);

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
