export const TableName = {
  Analyses: 'analyses',
  Demos: 'demos',
  Matches: 'matches',
  MatchScoreboard: 'match-scoreboard',
  PlayerGrenadeAverages: 'player-grenade-averages',
  PlayerGrenadesFlashedByPlayers: 'player-grenades-flashed-by-players',
  PlayerGrenadesFlashedPlayers: 'player-grenades-flashed-players',
  Players: 'players',
  Teams: 'teams',
} as const;

export type TableName = (typeof TableName)[keyof typeof TableName];
