import type { Game, TeamNumber } from 'csdm/common/types/counter-strike';
import type { Kill } from '../kill';

export type MultiKillResult = {
  id: string;
  matchChecksum: string;
  matchTickrate: number;
  demoPath: string;
  game: Game;
  tick: number;
  killerSteamId: string;
  killerName: string;
  roundNumber: number;
  mapName: string;
  date: string;
  side: TeamNumber;
  kills: Kill[];
};
