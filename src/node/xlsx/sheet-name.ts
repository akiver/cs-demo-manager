export const SheetName = {
  General: 'general',
  Players: 'players',
  Rounds: 'rounds',
  Kills: 'kills',
  Weapons: 'weapons',
  PlayersFlashbangMatrix: 'players-flashbang-matrix',
} as const;

export type SheetName = (typeof SheetName)[keyof typeof SheetName];
