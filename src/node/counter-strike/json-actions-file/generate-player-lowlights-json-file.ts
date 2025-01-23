import { Perspective } from 'csdm/common/types/perspective';
import type { Action } from 'csdm/node/database/watch/get-match-playback';
import { JSONActionsFileGenerator } from './json-actions-file-generator';
import { Game } from 'csdm/common/types/counter-strike';
import type { PlayerWatchInfo } from 'csdm/common/types/player-watch-info';

function getSteamIdToFocusFromAction(isPlayerPerspective: boolean, action: Action) {
  return isPlayerPerspective
    ? (action.opponentSteamId ?? action.playerSteamId)
    : (action.playerSteamId ?? action.opponentSteamId);
}

function getSlotToFocusFromAction(isPlayerPerspective: boolean, action: Action) {
  return isPlayerPerspective ? (action.playerSlot ?? action.opponentSlot) : (action.opponentSlot ?? action.playerSlot);
}

function getPlayerIdToFocusFromAction(isPlayerPerspective: boolean, action: Action, game: Game) {
  return game === Game.CSGO
    ? getSteamIdToFocusFromAction(isPlayerPerspective, action)
    : getSlotToFocusFromAction(isPlayerPerspective, action);
}

type Parameters = {
  demoPath: string;
  game: Game;
  tickrate: number;
  tickCount: number;
  actions: Action[];
  perspective: Perspective;
  beforeDelaySeconds: number;
  nextDelaySeconds: number;
  playerVoicesEnabled: boolean;
  players: PlayerWatchInfo[];
};

export async function generatePlayerLowlightsJsonFile({
  demoPath,
  game,
  actions,
  tickCount,
  tickrate,
  perspective,
  beforeDelaySeconds,
  nextDelaySeconds,
  playerVoicesEnabled,
  players,
}: Parameters) {
  const json = new JSONActionsFileGenerator(demoPath, game);

  if (playerVoicesEnabled) {
    json.enablePlayerVoices();
  } else {
    json.disablePlayerVoices();
  }

  json.generateVoiceAliases(players);

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
  let isFirstAction = true;

  for (const [index, action] of actions.entries()) {
    if (isFirstAction) {
      const playerIdToFocus = getPlayerIdToFocusFromAction(isPlayerPerspective, action, game);
      if (!playerIdToFocus) {
        continue;
      }

      // It's the first action so just skip ahead and focus the camera on the player
      const toTick = Math.max(0, action.tick - tickBeforeDelayCount);
      json.addSkipAhead(0, toTick);
      json.addSpecPlayer(toTick, playerIdToFocus);
      isFirstAction = false;
    }

    const nextAction = index === actions.length - 1 ? undefined : actions[index + 1];

    if (nextAction === undefined) {
      const stopTick = Math.min(tickCount, action.tick + tickNextDelayCount);
      json.addStopPlayback(stopTick);
    } else {
      const playerIdToFocus = getPlayerIdToFocusFromAction(isPlayerPerspective, nextAction, game);
      if (!playerIdToFocus) {
        continue;
      }

      const isNextActionTooFarAway = nextAction.tick - action.tick > maxNextActionDelayTickCount;
      if (isNextActionTooFarAway) {
        const skipAheadTick = action.tick + tickNextDelayCount;
        const toTick = nextAction.tick - tickBeforeDelayCount;
        json.addSkipAhead(skipAheadTick, toTick);
        json.addSpecPlayer(toTick, playerIdToFocus);
      } else {
        // The next action is too close, only move the camera on the victim
        const tick = Math.round(action.tick + (nextAction.tick - action.tick) / 2);
        json.addSpecPlayer(tick, playerIdToFocus);
      }
    }
  }

  await json.write();

  return json;
}
