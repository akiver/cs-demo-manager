export const TableName = {
  Analyses: 'analyses',
  Demos: 'demos',
  Matches: 'matches',
  MatchScoreboard: 'match-scoreboard',
  Players: 'players',
  Teams: 'teams',
} as const;

export type TableName = (typeof TableName)[keyof typeof TableName];
