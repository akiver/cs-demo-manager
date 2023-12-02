import type { Kill } from 'csdm/common/types/kill';
import type { Game } from '../counter-strike';

export type WallbangKillResult = Kill & {
  mapName: string;
  date: string;
  demoPath: string;
  game: Game;
};
