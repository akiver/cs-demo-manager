import type { Round } from '../launcher/watch-player-rounds';
import { JSONActionsFileGenerator } from './json-actions-file-generator';

type Options = {
  demoPath: string;
  rounds: Round[];
  playerSlot: number;
  beforeDelaySeconds: number;
  afterDelaySeconds: number;
  playerVoicesEnabled: boolean;
};

export async function generatePlayerRoundsJsonFile({
  demoPath,
  rounds,
  playerSlot,
  beforeDelaySeconds,
  afterDelaySeconds,
  playerVoicesEnabled,
}: Options) {
  const json = new JSONActionsFileGenerator(demoPath);

  if (playerVoicesEnabled) {
    json.addListenPlayerVoices();
  }

  const beforeRoundTicks = beforeDelaySeconds > 0 ? beforeDelaySeconds * 64 : 128;
  const afterRoundTicks = afterDelaySeconds > 0 ? afterDelaySeconds * 64 : 128;
  let currentTick = 0;
  for (let index = 0; index < rounds.length; index++) {
    const round = rounds[index];
    const startTick = Math.max(round.freezeTimeEndTick - beforeRoundTicks, 0);
    if (currentTick + afterRoundTicks < startTick) {
      json.addSkipAhead(currentTick, startTick);
    }
    json.addSpecPlayer(currentTick, playerSlot);

    if (round.deathTick !== null) {
      currentTick = round.deathTick + afterRoundTicks;
    } else {
      currentTick = round.tickEnd + afterRoundTicks;
    }

    if (index === rounds.length - 1) {
      json.addStopPlayback(currentTick + afterRoundTicks);
    }
  }

  await json.write();

  return json;
}
