import { Game } from 'csdm/common/types/counter-strike';
import { startCounterStrike } from './start-counter-strike';
import { VDMGenerator } from 'csdm/node/vdm/generator';
import { JSONActionsFileGenerator } from '../json-actions-file/json-actions-file-generator';
import { detectDemoGame } from './detect-demo-game';
import { deleteJsonActionsFile } from '../json-actions-file/delete-json-actions-file';
import { getSettings } from 'csdm/node/settings/get-settings';
import { watchDemoWithHlae } from './watch-demo-with-hlae';

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
    generator.addSpecPlayer(startTick ?? 0, steamId);
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

  const settings = await getSettings();
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
