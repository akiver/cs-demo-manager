import type { Game } from 'csdm/common/types/counter-strike';
import type { DownloadStatus } from 'csdm/common/types/download-status';

export type FaceitPlayer = {
  id: string;
  name: string;
  avatarUrl: string;
  teamId: string;
  teamName: string;
  killCount: number;
  assistCount: number;
  deathCount: number;
  headshotCount: number;
  headshotPercentage: number;
  killDeathRatio: number;
  killPerRound: number;
  mvpCount: number;
  threeKillCount: number;
  fourKillCount: number;
  fiveKillCount: number;
};

export type FaceitTeam = {
  id: string;
  name: string;
  score: number;
  firstHalfScore: number;
  secondHalfScore: number;
  overtimeScore: number;
};

export type FaceitMatch = {
  id: string;
  game: Game;
  date: string;
  durationInSeconds: number;
  demoUrl: string;
  mapName: string;
  gameMode: string;
  url: string;
  players: FaceitPlayer[];
  teams: FaceitTeam[];
  winnerId: string;
  winnerName: string;
  downloadStatus: DownloadStatus;
};
