export const TableName = {
  Matches: 'matches',
  Demos: 'demos',
  MatchScoreboard: 'match-scoreboard',
  Players: 'players',
  Teams: 'teams',
} as const;

export type TableName = (typeof TableName)[keyof typeof TableName];
