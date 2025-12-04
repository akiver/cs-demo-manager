import type { Kill } from 'csdm/common/types/kill';
import type { Game, TeamNumber } from '../counter-strike';

export type KillResult = {
  id: string;
  side: TeamNumber;
  tick: number;
  killerSteamId: string;
  killerName: string;
  roundNumber: number;
  mapName: string;
  date: string;
  demoPath: string;
  game: Game;
  matchChecksum: string;
  kills: Kill[];
  roundComment: string;
};
