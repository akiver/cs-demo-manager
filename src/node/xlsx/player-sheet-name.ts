export const PlayerSheetName = {
  General: 'general',
  Players: 'players',
  Clutch: 'clutch',
  Maps: 'maps',
  Utility: 'utility',
  Economy: 'economy',
  Rounds: 'rounds',
} as const;

export type PlayerSheetName = (typeof PlayerSheetName)[keyof typeof PlayerSheetName];
