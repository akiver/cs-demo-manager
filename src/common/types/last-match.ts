import type { Game } from 'csdm/common/types/counter-strike';

export type LastMatch = {
  checksum: string;
  game: Game;
  date: string;
  scoreTeamA: number;
  scoreTeamB: number;
  mapName: string;
  winnerName: string;
  focusTeamName: string;
};
