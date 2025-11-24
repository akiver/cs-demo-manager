import { Game } from './counter-strike';

export function isValidGame(game: unknown): game is Game {
  return Object.values(Game).includes(game as Game);
}
