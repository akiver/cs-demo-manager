export const SheetName = {
  General: 'general',
  Players: 'players',
  Rounds: 'rounds',
  Kills: 'kills',
} as const;

export type SheetName = (typeof SheetName)[keyof typeof SheetName];
