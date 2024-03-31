import { VDMGenerator } from './generator';
import type { Round } from '../counter-strike/launcher/watch-player-rounds';

type Options = {
  tickrate: number;
  demoPath: string;
  rounds: Round[];
  steamId: string;
  beforeDelaySeconds: number;
  afterDelaySeconds: number;
};

export async function generatePlayerRoundsVdmFile({
  tickrate,
  demoPath,
  rounds,
  steamId,
  beforeDelaySeconds,
  afterDelaySeconds,
}: Options) {
  const vdm = new VDMGenerator(demoPath);

  const beforeRoundTicks = beforeDelaySeconds > 0 ? beforeDelaySeconds * tickrate : 0;
  const afterRoundTicks = afterDelaySeconds > 0 ? afterDelaySeconds * tickrate : tickrate;
  let currentTick = 0;
  for (let index = 0; index < rounds.length; index++) {
    const round = rounds[index];
    const startTick = Math.max(round.freezeTimeEndTick - beforeRoundTicks, 0);
    if (currentTick + afterRoundTicks < startTick) {
      vdm.addSkipAhead(currentTick, startTick);
    }
    vdm.addSpecPlayer(currentTick, steamId);

    if (round.deathTick !== null) {
      currentTick = round.deathTick + afterRoundTicks;
    } else {
      currentTick = round.tickEnd + afterRoundTicks;
    }

    if (index === rounds.length - 1) {
      vdm.addStopPlayback(currentTick + afterRoundTicks);
    }
  }

  await vdm.write();

  return vdm;
}
