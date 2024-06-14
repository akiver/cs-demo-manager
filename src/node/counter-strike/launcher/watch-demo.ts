import { Game } from 'csdm/common/types/counter-strike';
import { startCounterStrike } from './start-counter-strike';
import { VDMGenerator } from 'csdm/node/vdm/generator';
import { JSONActionsFileGenerator } from '../json-actions-file/json-actions-file-generator';
import { detectDemoGame } from './detect-demo-game';
import { deleteJsonActionsFile } from '../json-actions-file/delete-json-actions-file';
import { getSettings } from 'csdm/node/settings/get-settings';
import { watchDemoWithHlae } from './watch-demo-with-hlae';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { fetchMatchPlayersSlots } from 'csdm/node/database/match/fetch-match-players-slots';

async function generateVdmFile(demoPath: string, startTick?: number, steamId?: string) {
  const vdm = new VDMGenerator(demoPath);
  if (startTick) {
    vdm.addSkipAhead(0, startTick);
  }
  if (steamId !== undefined) {
    vdm.addSpecPlayer(startTick ?? 0, steamId);
  }

  await vdm.write();
}

async function generateJsonActionsFile(
  demoPath: string,
  playerVoicesEnabled: boolean,
  startTick?: number,
  steamId?: string,
) {
  const generator = new JSONActionsFileGenerator(demoPath);

  if (playerVoicesEnabled) {
    generator.addListenPlayerVoices();
  }

  if (startTick) {
    generator.addSkipAhead(0, startTick);
  }

  if (steamId !== undefined) {
    const checksum = await getDemoChecksumFromDemoPath(demoPath);
    const slots = await fetchMatchPlayersSlots(checksum);
    const slot = slots[steamId];
    if (slot) {
      generator.addSpecPlayer(startTick ?? 0, slot);
    }
  }

  await generator.write();
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
  const { playerVoicesEnabled } = settings.playback;

  if (game === Game.CSGO) {
    await generateVdmFile(demoPath, startTick, focusSteamId);
  } else {
    await deleteJsonActionsFile(demoPath);
    await generateJsonActionsFile(demoPath, playerVoicesEnabled, startTick, focusSteamId);
  }

  if (settings.playback.useHlae) {
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
