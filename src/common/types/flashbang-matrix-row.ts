import type { TeamNumber } from './counter-strike';

export type FlashbangMatrixRow = {
  flasherSteamId: string;
  flasherName: string;
  flasherTeamSide: TeamNumber;
  flashedSteamId: string;
  flashedName: string;
  flashedTeamSide: TeamNumber;
  duration: number;
};
