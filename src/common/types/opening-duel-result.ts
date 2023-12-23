export const OpeningDuelResult = {
  Won: 'won',
  Lost: 'lost',
} as const;

export type OpeningDuelResult = (typeof OpeningDuelResult)[keyof typeof OpeningDuelResult];
