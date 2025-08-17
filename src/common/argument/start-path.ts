export const StartPath = {
  Bans: 'bans',
  Demos: 'demos',
  Downloads: 'downloads',
  Matches: 'matches',
  Players: 'players',
  Search: 'search',
  Settings: 'settings',
  Teams: 'teams',
} as const;
export type StartPath = (typeof StartPath)[keyof typeof StartPath];
