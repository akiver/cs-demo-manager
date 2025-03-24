export type MapStats = {
  mapName: string;
  matchCount: number;
  winCount: number;
  lostCount: number;
  tiedCount: number;
  roundCount: number;
  roundCountAsT: number;
  roundCountAsCt: number;
  roundWinCount: number;
  roundLostCount: number;
  roundWinCountAsCt: number;
  roundWinCountAsT: number;
  killDeathRatio: number;
  averageDamagesPerRound: number;
  kast: number;
  headshotPercentage: number;
};

export type PlayerMapsStats = MapStats & {
  steamId: string;
};
