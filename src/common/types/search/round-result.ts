import type { Round } from '../round';
import type { Game } from '../counter-strike';

export type RoundResult = Round & {
  mapName: string;
  date: string;
  demoPath: string;
  game: Game;
};
