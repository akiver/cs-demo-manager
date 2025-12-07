import type { DownloadStatus } from 'csdm/common/types/download-status';
import type { Game } from './counter-strike';

type RenownTeam = {
  name: string;
  score: number;
};

export type RenownPlayer = {
  steamId: string;
  name: string;
  avatarUrl: string;
  teamName: string;
  adr: number;
  killCount: number;
  assistCount: number;
  deathCount: number;
  killDeathRatio: number;
  mvpCount: number;
  threeKillCount: number;
  fourKillCount: number;
  fiveKillCount: number;
  headshotCount: number;
  headshotPercentage: number;
  damageDealt: number;
  utilityDamage: number;
  eloBefore: number | null;
  eloChange: number | null;
  leetifyRating: number | null;
};

export type RenownMatch = {
  id: string;
  game: Game;
  date: string;
  durationInSeconds: number;
  demoUrl: string;
  mapName: string;
  url: string;
  downloadStatus: DownloadStatus;
  players: RenownPlayer[];
  team1: RenownTeam;
  team2: RenownTeam;
  winnerTeamName: string;
  leetifyMatchUrl: string | null;
};
