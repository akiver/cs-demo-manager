import { assertNever } from 'csdm/common/assert-never';
import { Game } from 'csdm/common/types/counter-strike';

export function getGameName(game: Game) {
  switch (game) {
    case Game.CSGO:
      return 'CS:GO';
    case Game.CS2:
      return 'CS2';
    case Game.CS2LT:
      return 'CS2 Limited Test';
    default:
      assertNever(game, `Unknown game: ${game}`);
  }
}
