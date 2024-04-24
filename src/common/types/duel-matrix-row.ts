import type { TeamNumber } from './counter-strike';

export type DuelMatrixRow = {
  killerSteamId: string;
  killerName: string;
  killerTeamSide: TeamNumber;
  victimSteamId: string;
  victimName: string;
  victimTeamSide: TeamNumber;
  killCount: number;
  deathCount: number;
};
