import type { Game } from 'csdm/common/types/counter-strike';
import type { Round } from '../launcher/watch-player-rounds';
import { JSONActionsFileGenerator } from './json-actions-file-generator';
import type { PlayerWatchInfo } from 'csdm/common/types/player-watch-info';

type Options = {
  tickrate: number;
  demoPath: string;
  game: Game;
  rounds: Round[];
  players: PlayerWatchInfo[];
  playerId: number | string;
  beforeDelaySeconds: number;
  afterDelaySeconds: number;
  playerVoicesEnabled: boolean;
};

export async function generatePlayerRoundsJsonFile({
  tickrate,
  demoPath,
  game,
  rounds,
  players,
  playerId,
  beforeDelaySeconds,
  afterDelaySeconds,
  playerVoicesEnabled,
}: Options) {
  const json = new JSONActionsFileGenerator(demoPath, game);

  if (playerVoicesEnabled) {
    json.enablePlayerVoices();
  } else {
    json.disablePlayerVoices();
  }

  json.generateVoiceAliases(players);

  const beforeRoundTicks = beforeDelaySeconds > 0 ? beforeDelaySeconds * tickrate : 128;
  const afterRoundTicks = afterDelaySeconds > 0 ? afterDelaySeconds * tickrate : tickrate;
  let currentTick = 0;
  for (let index = 0; index < rounds.length; index++) {
    const round = rounds[index];
    const startTick = Math.max(round.freezeTimeEndTick - beforeRoundTicks, 0);
    if (currentTick + afterRoundTicks < startTick) {
      json.addSkipAhead(currentTick, startTick);
    }
    json.addSpecPlayer(currentTick, playerId);

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
