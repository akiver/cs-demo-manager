import { Perspective } from 'csdm/common/types/perspective';
import type { PlaybackMatch } from 'csdm/node/database/watch/get-match-playback';
import { JSONActionsFileGenerator } from './json-actions-file-generator';

type Options = {
  match: PlaybackMatch;
  perspective: Perspective;
  beforeDelaySeconds: number;
  nextDelaySeconds: number;
  playerVoicesEnabled: boolean;
};

export async function generatePlayerHighlightsJsonFile({
  match,
  perspective,
  beforeDelaySeconds,
  nextDelaySeconds,
  playerVoicesEnabled,
}: Options) {
  const json = new JSONActionsFileGenerator(match.demoPath);

  if (playerVoicesEnabled) {
    json.addListenPlayerVoices();
  }

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
  const maxNextActionDelaySeconds = 15;
  const maxNextActionDelayTickCount = Math.max(Math.round(tickrate * maxNextActionDelaySeconds), tickNextDelayCount);
  const actions = match.actions;
  const { steamId } = match;

  for (const [index, action] of actions.entries()) {
    const isFirstAction = index === 0;
    if (isFirstAction) {
      // It's the first action so just skip ahead and focus the camera on the player
      const toTick = Math.max(0, action.tick - tickBeforeDelayCount);
      json.addSkipAhead(0, toTick);
      json.addSpecPlayer(toTick, isPlayerPerspective ? steamId : action.opponentSteamId);
    }

    const nextAction = index === actions.length - 1 ? undefined : actions[index + 1];

    if (nextAction === undefined) {
      const stopTick = Math.min(match.tickCount, action.tick + tickNextDelayCount);
      json.addStopPlayback(stopTick);
    } else {
      const isNextActionTooFarAway = nextAction.tick - action.tick > maxNextActionDelayTickCount;

      if (isNextActionTooFarAway) {
        const skipAheadTick = action.tick + tickNextDelayCount;
        const toTick = nextAction.tick - tickBeforeDelayCount;
        json.addSkipAhead(skipAheadTick, toTick);
        const steamIdToFocus = isPlayerPerspective ? steamId : nextAction.opponentSteamId;
        json.addSpecPlayer(toTick, steamIdToFocus);
      } else {
        // The next action is too close, only move the camera on the player
        const tick = Math.round(action.tick + (nextAction.tick - action.tick) / 2);
        const steamIdToFocus = isPlayerPerspective ? steamId : nextAction.opponentSteamId;
        json.addSpecPlayer(tick, steamIdToFocus);
      }
    }
  }

  await json.write();

  return json;
}
