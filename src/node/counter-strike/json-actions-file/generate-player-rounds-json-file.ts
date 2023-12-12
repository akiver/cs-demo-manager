import type { Round } from '../launcher/watch-player-rounds';
import { JSONActionsFileGenerator } from './json-actions-file-generator';

type Options = {
  demoPath: string;
  rounds: Round[];
  steamId: string;
};

export async function generatePlayerRoundsJsonFile({ demoPath, rounds, steamId }: Options) {
  const json = new JSONActionsFileGenerator(demoPath);

  let currentTick = 0;
  for (let index = 0; index < rounds.length; index++) {
    const round = rounds[index];
    json.addSkipAhead(currentTick, round.freezeTimeEndTick);
    json.addSpecPlayer(currentTick, steamId);

    if (round.deathTick !== null) {
      currentTick = round.deathTick + 128;
    } else {
      currentTick = round.tickEnd + 128;
    }

    if (index === rounds.length - 1) {
      json.addStopPlayback(currentTick);
    }
  }

  await json.write();

  return json;
}
