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

export async function generatePlayerLowlightsVdmFile({
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
  const maxNextActionDelayInSeconds = 15;
  const maxNextActionDelayTickCount = Math.max(Math.round(tickrate * maxNextActionDelayInSeconds), tickNextDelayCount);
  const isPlayerPerspective = perspective === Perspective.Player;
  const actions = match.actions;

  for (const [index, action] of actions.entries()) {
    const isFirstAction = index === 0;
    if (isFirstAction) {
      // It's the first action so just skip ahead and focus the camera on the player
      const toTick = Math.max(0, action.tick - tickBeforeDelayCount);
      const steamIdToFocus = isPlayerPerspective ? steamId : action.playerSteamId ?? steamId;
      vdm.addSkipAhead(0, toTick);
      vdm.addSpecPlayer(toTick, steamIdToFocus);
    }

    const nextAction = index === actions.length - 1 ? undefined : actions[index + 1];

    if (nextAction === undefined) {
      const stopTick = Math.min(match.tickCount, action.tick + tickNextDelayCount);
      vdm.addStopPlayback(stopTick);
    } else {
      const isNextActionTooFarAway = nextAction.tick - action.tick > maxNextActionDelayTickCount;
      if (isNextActionTooFarAway) {
        const skipAheadTick = action.tick + tickNextDelayCount;
        const toTick = nextAction.tick - tickBeforeDelayCount;
        vdm.addSkipAhead(skipAheadTick, toTick);
        const steamIdToFocus = isPlayerPerspective ? steamId : nextAction.playerSteamId ?? steamId;
        vdm.addSpecPlayer(toTick, steamIdToFocus);

        if (nextAction.roundNumber > action.roundNumber) {
          const nextRoundMessageDelayInSeconds = 1;
          const fadeTick = skipAheadTick - Math.round(tickrate * nextRoundMessageDelayInSeconds);
          vdm.addTextMessage(fadeTick, `Skipping to the next action in round ${nextAction.roundNumber}`);
          vdm.addScreenFade(fadeTick);
        }
      } else {
        // The next action is too close, only move the camera on the victim
        const tick = Math.round(action.tick + (nextAction.tick - action.tick) / 2);
        const steamIdToFocus = isPlayerPerspective ? steamId : nextAction.playerSteamId ?? steamId;
        vdm.addSpecPlayer(tick, steamIdToFocus);
      }
    }
  }

  await vdm.write();

  return vdm;
}
