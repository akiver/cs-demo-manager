export const TableName = {
  Matches: 'matches',
  Demos: 'demos',
  MatchScoreboard: 'match-scoreboard',
  Players: 'players',
} as const;

export type TableName = (typeof TableName)[keyof typeof TableName];
