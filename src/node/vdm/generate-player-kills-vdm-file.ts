import { Perspective } from 'csdm/common/types/perspective';
import type { PlaybackMatch } from 'csdm/node/database/watch/get-match-playback';
import { VDMGenerator } from './generator';

type Options = {
  match: PlaybackMatch;
  steamId: string;
  perspective: Perspective;
  beforeDelaySeconds: number;
  nextDelaySeconds: number;
};

export async function generatePlayerKillsVdmFile({
  match,
  perspective,
  steamId,
  beforeDelaySeconds,
  nextDelaySeconds,
}: Options) {
  const vdm = new VDMGenerator(match.demoPath);
  if (nextDelaySeconds < 1) {
    nextDelaySeconds = 1;
  }
  if (beforeDelaySeconds < 1) {
    beforeDelaySeconds = 1;
  }

  const tickrate = match.tickrate;
  const tickBeforeDelayCount = Math.round(tickrate * beforeDelaySeconds);
  const tickNextDelayCount = Math.round(tickrate * nextDelaySeconds);
  const isPlayerPerspective = perspective === Perspective.Player;
  const maxNextKillDelaySeconds = 15;
  const maxNextKillDelayTickCount = Math.max(Math.round(tickrate * maxNextKillDelaySeconds), tickNextDelayCount);
  const kills = match.kills;

  for (const [index, kill] of kills.entries()) {
    const isFirstKill = index === 0;
    if (isFirstKill) {
      // It's the first kill so just skip ahead and focus the camera on the player
      const toTick = Math.max(0, kill.tick - tickBeforeDelayCount);
      vdm.addSkipAhead(0, toTick);
      vdm.addSpecPlayer(toTick, isPlayerPerspective ? steamId : kill.victimSteamId);
    }

    const nextKill = index === kills.length - 1 ? undefined : kills[index + 1];

    if (nextKill === undefined) {
      const stopTick = Math.min(match.tickCount, kill.tick + tickNextDelayCount);
      vdm.addStopPlayback(stopTick);
    } else {
      const isNextKillTooFarAway = nextKill.tick - kill.tick > maxNextKillDelayTickCount;
      if (isNextKillTooFarAway) {
        const skipAheadTick = kill.tick + tickNextDelayCount;
        const toTick = nextKill.tick - tickBeforeDelayCount;
        vdm.addSkipAhead(skipAheadTick, toTick);
        const steamIdToFocus = isPlayerPerspective ? steamId : nextKill.victimSteamId;
        vdm.addSpecPlayer(toTick, steamIdToFocus);

        if (nextKill.roundNumber > kill.roundNumber) {
          const nextRoundMessageDelayInSeconds = 1;
          const fadeTick = skipAheadTick - Math.round(tickrate * nextRoundMessageDelayInSeconds);
          vdm.addTextMessage(fadeTick, `Skipping to the next kill in round ${nextKill.roundNumber}`);
          vdm.addScreenFade(fadeTick);
        }
      } else {
        // The next kill is too close, only move the camera on the player
        const tick = Math.round(kill.tick + (nextKill.tick - kill.tick) / 2);
        const steamIdToFocus = isPlayerPerspective ? steamId : nextKill.victimSteamId;
        vdm.addSpecPlayer(tick, steamIdToFocus);
      }
    }
  }

  await vdm.write();

  return vdm;
}
