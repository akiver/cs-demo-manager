import { Perspective } from 'csdm/common/types/perspective';
import type { Action } from 'csdm/node/database/watch/get-match-playback';
import { VDMGenerator } from './generator';

function getSteamIdToFocusFromAction(isPlayerPerspective: boolean, action: Action) {
  return isPlayerPerspective
    ? (action.opponentSteamId ?? action.playerSteamId)
    : (action.playerSteamId ?? action.opponentSteamId);
}

type Parameters = {
  demoPath: string;
  tickrate: number;
  tickCount: number;
  actions: Action[];
  perspective: Perspective;
  beforeDelaySeconds: number;
  nextDelaySeconds: number;
};

export async function generatePlayerLowlightsVdmFile({
  demoPath,
  actions,
  tickCount,
  tickrate,
  perspective,
  beforeDelaySeconds,
  nextDelaySeconds,
}: Parameters) {
  const vdm = new VDMGenerator(demoPath);
  if (nextDelaySeconds < 1) {
    nextDelaySeconds = 1;
  }
  if (beforeDelaySeconds < 1) {
    beforeDelaySeconds = 1;
  }

  const tickBeforeDelayCount = Math.round(tickrate * beforeDelaySeconds);
  const tickNextDelayCount = Math.round(tickrate * nextDelaySeconds);
  const maxNextActionDelayInSeconds = 15;
  const maxNextActionDelayTickCount = Math.max(Math.round(tickrate * maxNextActionDelayInSeconds), tickNextDelayCount);
  const isPlayerPerspective = perspective === Perspective.Player;

  for (const [index, action] of actions.entries()) {
    const isFirstAction = !vdm.hasActions();
    if (isFirstAction) {
      const steamIdToFocus = getSteamIdToFocusFromAction(isPlayerPerspective, action);
      if (steamIdToFocus) {
        // It's the first action so just skip ahead and focus the camera on the player
        const toTick = Math.max(0, action.tick - tickBeforeDelayCount);
        vdm.addSkipAhead(0, toTick);
        vdm.addSpecPlayer(toTick, steamIdToFocus);
      }
    }

    const nextAction = index === actions.length - 1 ? undefined : actions[index + 1];

    if (nextAction === undefined) {
      const stopTick = Math.min(tickCount, action.tick + tickNextDelayCount);
      vdm.addStopPlayback(stopTick);
    } else {
      const steamIdToFocus = getSteamIdToFocusFromAction(isPlayerPerspective, nextAction);
      if (!steamIdToFocus) {
        continue;
      }

      const isNextActionTooFarAway = nextAction.tick - action.tick > maxNextActionDelayTickCount;
      if (isNextActionTooFarAway) {
        const skipAheadTick = action.tick + tickNextDelayCount;
        const toTick = nextAction.tick - tickBeforeDelayCount;
        vdm.addSkipAhead(skipAheadTick, toTick);
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
        vdm.addSpecPlayer(tick, steamIdToFocus);
      }
    }
  }

  await vdm.write();

  return vdm;
}
