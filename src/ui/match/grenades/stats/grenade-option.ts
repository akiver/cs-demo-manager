export const GrenadeOption = {
  Flashbang: 'flashbang',
  HE: 'he',
  Fire: 'fire',
  Smoke: 'smoke',
} as const;

export type GrenadeOption = (typeof GrenadeOption)[keyof typeof GrenadeOption];
