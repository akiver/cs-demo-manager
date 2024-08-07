import { Perspective } from 'csdm/common/types/perspective';
import type { Action } from 'csdm/node/database/watch/get-match-playback';
import { JSONActionsFileGenerator } from './json-actions-file-generator';

function getSlotToFocusFromAction(isPlayerPerspective: boolean, action: Action) {
  return isPlayerPerspective ? (action.playerSlot ?? action.opponentSlot) : (action.opponentSlot ?? action.playerSlot);
}

type Parameters = {
  demoPath: string;
  tickrate: number;
  tickCount: number;
  actions: Action[];
  perspective: Perspective;
  beforeDelaySeconds: number;
  nextDelaySeconds: number;
  playerVoicesEnabled: boolean;
};

export async function generatePlayerHighlightsJsonFile({
  demoPath,
  actions,
  tickCount,
  tickrate,
  perspective,
  beforeDelaySeconds,
  nextDelaySeconds,
  playerVoicesEnabled,
}: Parameters) {
  const json = new JSONActionsFileGenerator(demoPath);

  if (nextDelaySeconds < 1) {
    nextDelaySeconds = 1;
  }
  if (beforeDelaySeconds < 1) {
    beforeDelaySeconds = 1;
  }

  const tickBeforeDelayCount = Math.round(tickrate * beforeDelaySeconds);
  const tickNextDelayCount = Math.round(tickrate * nextDelaySeconds);
  const isPlayerPerspective = perspective === Perspective.Player;
  const maxNextActionDelaySeconds = 15;
  const maxNextActionDelayTickCount = Math.max(Math.round(tickrate * maxNextActionDelaySeconds), tickNextDelayCount);

  for (const [index, action] of actions.entries()) {
    const isFirstAction = !json.hasActions();
    if (isFirstAction) {
      const slotToFocus = getSlotToFocusFromAction(isPlayerPerspective, action);
      if (!slotToFocus) {
        continue;
      }

      // It's the first action so just skip ahead and focus the camera on the player
      const toTick = Math.max(0, action.tick - tickBeforeDelayCount);
      json.addSkipAhead(0, toTick);
      json.addSpecPlayer(toTick, slotToFocus);
    }

    const nextAction = index === actions.length - 1 ? undefined : actions[index + 1];

    if (nextAction === undefined) {
      const stopTick = Math.min(tickCount, action.tick + tickNextDelayCount);
      json.addStopPlayback(stopTick);
    } else {
      const slotToFocus = getSlotToFocusFromAction(isPlayerPerspective, nextAction);
      if (!slotToFocus) {
        continue;
      }

      const isNextActionTooFarAway = nextAction.tick - action.tick > maxNextActionDelayTickCount;
      if (isNextActionTooFarAway) {
        const skipAheadTick = action.tick + tickNextDelayCount;
        const toTick = nextAction.tick - tickBeforeDelayCount;
        json.addSkipAhead(skipAheadTick, toTick);
        json.addSpecPlayer(toTick, slotToFocus);
      } else {
        // The next action is too close, only move the camera on the player
        const tick = Math.round(action.tick + (nextAction.tick - action.tick) / 2);
        json.addSpecPlayer(tick, slotToFocus);
      }
    }
  }

  if (playerVoicesEnabled) {
    json.addListenPlayerVoices();
  }

  await json.write();

  return json;
}
