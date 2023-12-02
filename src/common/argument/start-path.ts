export const StartPath = {
  Players: 'players',
  Bans: 'bans',
  Downloads: 'downloads',
  Settings: 'settings',
} as const;
export type StartPath = (typeof StartPath)[keyof typeof StartPath];
