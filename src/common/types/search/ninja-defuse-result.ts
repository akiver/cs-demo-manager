import type { BombDefused } from 'csdm/common/types/bomb-defused';
import type { Game } from '../counter-strike';

export type NinjaDefuseResult = BombDefused & {
  mapName: string;
  date: string;
  demoPath: string;
  game: Game;
};
