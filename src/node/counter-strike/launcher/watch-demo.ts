import { Game } from 'csdm/common/types/counter-strike';
import { startCounterStrike } from './start-counter-strike';
import { VDMGenerator } from 'csdm/node/vdm/generator';
import { JSONActionsFileGenerator } from '../json-actions-file/json-actions-file-generator';
import { detectDemoGame } from './detect-demo-game';
import { deleteJsonActionsFile } from '../json-actions-file/delete-json-actions-file';
import { fetchPlayersIndexes } from 'csdm/node/database/players/fetch-players-indexes';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';

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

async function generateJsonActionsFile(demoPath: string, startTick?: number, steamId?: string) {
  const generator = new JSONActionsFileGenerator(demoPath);
  if (startTick) {
    generator.addSkipAhead(0, startTick);
  }

  if (steamId !== undefined) {
    // Override the SteamID by the player index as CS2 doesn't have a command to focus a player by SteamID yet
    // TODO CS2 This should be removed and any where we use player indexes once CS2 has a command to focus on a player by SteamID
    const checksum = await getDemoChecksumFromDemoPath(demoPath);
    const playerIndexes = await fetchPlayersIndexes(checksum);
    const playerIndex = playerIndexes[steamId];
    if (playerIndex) {
      generator.addSpecPlayer(startTick ?? 0, String(playerIndex));
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
  if (game === Game.CSGO) {
    await generateVdmFile(demoPath, startTick, focusSteamId);
  } else {
    await deleteJsonActionsFile(demoPath);
    await generateJsonActionsFile(demoPath, startTick, focusSteamId);
  }

  await startCounterStrike({
    ...options,
    game,
  });
}
