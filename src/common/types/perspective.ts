export const Perspective = {
  Player: 'player',
  Enemy: 'enemy',
} as const;

export type Perspective = (typeof Perspective)[keyof typeof Perspective];

export function isValidPerspective(value: string): value is Perspective {
  return Object.values(Perspective).includes(value as Perspective);
}
