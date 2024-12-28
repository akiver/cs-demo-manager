import type { Game } from 'csdm/common/types/counter-strike';
import type { DownloadStatus } from 'csdm/common/types/download-status';

export type FiveEPlayPlayer = {
  id: string; // uuid retrieved from the player's "domain"
  domainId: string; // the ID used in the player's page URL
  uid: number; // unique int player's id, used to know the player's team
  name: string;
  avatarUrl: string;
  hasWon: boolean;
  killCount: number;
  assistCount: number;
  deathCount: number;
  headshotCount: number;
  headshotPercentage: number;
  killDeathRatio: number;
  killPerRound: number;
  kast: number;
  threeKillCount: number;
  fourKillCount: number;
  fiveKillCount: number;
  firstKillCount: number;
  firstDeathCount: number;
  bombDefusedCount: number;
  bombPlantedCount: number;
  averageDamagePerRound: number;
};

type FiveEPlayTeam = {
  name: string;
  score: number;
  firstHalfScore: number;
  secondHalfScore: number;
  playerIds: number[];
};

export type FiveEPlayMatch = {
  id: string;
  game: Game;
  date: string;
  durationInSeconds: number;
  demoUrl: string;
  mapName: string;
  url: string;
  players: FiveEPlayPlayer[];
  teams: FiveEPlayTeam[];
  downloadStatus: DownloadStatus;
};
