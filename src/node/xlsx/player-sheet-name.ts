export const PlayerSheetName = {
  General: 'general',
  Maps: 'maps',
} as const;

export type PlayerSheetName = (typeof PlayerSheetName)[keyof typeof PlayerSheetName];
