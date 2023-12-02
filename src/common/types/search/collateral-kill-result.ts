import type { Game, TeamNumber } from 'csdm/common/types/counter-strike';
import type { Kill } from 'csdm/common/types/kill';

export type CollateralKillResult = {
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
};
