import type { Clutch } from '../clutch';
import type { Game } from '../counter-strike';

export type ClutchResult = Clutch & {
  game: Game;
  mapName: string;
  date: string;
  demoPath: string;
};
