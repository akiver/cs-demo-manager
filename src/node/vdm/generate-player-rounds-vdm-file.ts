import { VDMGenerator } from './generator';
import type { Round } from '../counter-strike/launcher/watch-player-rounds';

type Options = {
  demoPath: string;
  rounds: Round[];
  steamId: string;
};

export async function generatePlayerRoundsVdmFile({ demoPath, rounds, steamId }: Options) {
  const vdm = new VDMGenerator(demoPath);

  let currentTick = 0;
  for (let index = 0; index < rounds.length; index++) {
    const round = rounds[index];
    vdm.addSkipAhead(currentTick, round.freezeTimeEndTick);
    vdm.addSpecPlayer(currentTick, steamId);

    if (round.deathTick !== null) {
      currentTick = round.deathTick + 128;
    } else {
      currentTick = round.tickEnd + 128;
    }

    if (index === rounds.length - 1) {
      vdm.addStopPlayback(currentTick);
    }
  }

  await vdm.write();

  return vdm;
}
