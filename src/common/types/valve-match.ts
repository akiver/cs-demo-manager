import type { Game, TeamNumber } from 'csdm/common/types/counter-strike';
import type { DownloadStatus } from 'csdm/common/types/download-status';

export const ValveMatchResult = {
  Tied: 0,
  TWon: 1, // The team as T at the end of the match won
  CTWon: 2, // The team as CT at the end of the match won
} as const;
export type ValveMatchResult = (typeof ValveMatchResult)[keyof typeof ValveMatchResult];

export type ValvePlayerRound = {
  number: number;
  killCount: number;
  deathCount: number;
  assistCount: number;
  headshotCount: number;
  mvpCount: number;
  hasWon: boolean;
  teamNumber: TeamNumber;
};

export type ValvePlayer = {
  startMatchTeamNumber: TeamNumber;
  steamId: string;
  name: string;
  avatar: string;
  killCount: number;
  deathCount: number;
  assistCount: number;
  score: number;
  mvp: number;
  headshotCount: number;
  rounds: ValvePlayerRound[];
};

export type ValveMatch = {
  id: string;
  demoChecksum?: string; // It's the demo/match checksum used as unique identifier
  name: string;
  game: Game;
  mapName: string;
  date: string;
  durationInSeconds: number;
  scoreTeamStartedCT: number;
  scoreTeamStartedT: number;
  result: ValveMatchResult;
  teamNameStartedCT: string;
  teamNameStartedT: string;
  killCount: number;
  assistCount: number;
  deathCount: number;
  players: ValvePlayer[];
  demoUrl: string;
  sharecode: string;
  downloadStatus: DownloadStatus;
  protobufBytes: Uint8Array; // Original protobuf message
};
