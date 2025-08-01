import type { Match } from 'csdm/common/types/match';

export type MatchTablePlayer = {
  steamId: string;
  name: string;
};

export type MatchTable = Pick<
  Match,
  | 'checksum'
  | 'game'
  | 'assistCount'
  | 'demoFilePath'
  | 'killCount'
  | 'deathCount'
  | 'collateralKillCount'
  | 'name'
  | 'mapName'
  | 'source'
  | 'type'
  | 'clientName'
  | 'duration'
  | 'tickCount'
  | 'tickrate'
  | 'frameRate'
  | 'serverName'
  | 'analyzeDate'
  | 'gameMode'
  | 'isRanked'
  | 'comment'
  | 'tagIds'
  | 'shareCode'
> & {
  date: string;
  bannedPlayerCount: number;
  teamAName: string;
  teamBName: string;
  teamAScore: number;
  teamBScore: number;
  fiveKillCount: number;
  fourKillCount: number;
  threeKillCount: number;
  hltvRating2: number;
  players: MatchTablePlayer[];
};
