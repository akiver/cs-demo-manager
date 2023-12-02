export const Perspective = {
  Player: 'player',
  Enemy: 'enemy',
} as const;

export type Perspective = (typeof Perspective)[keyof typeof Perspective];
