export type PlayerChartsData = {
  headshotPercentage: number;
  killDeathRatio: number;
  averageDamagePerRound: number;
  clutchWonPercentage: number;
  matchDate: string;
};

export type PlayerChartDataField = keyof Omit<PlayerChartsData, 'matchDate'>;
