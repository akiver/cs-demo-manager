export type BombDamageBand = {
  minDamage: number;
  color: number[];
  alpha: number;
};

export const BOMB_DAMAGE_BANDS: BombDamageBand[] = [
  { minDamage: 100, color: [255, 64, 160], alpha: 0.62 },
  { minDamage: 75, color: [222, 72, 214], alpha: 0.5 },
  { minDamage: 50, color: [176, 96, 235], alpha: 0.42 },
  { minDamage: 25, color: [132, 118, 236], alpha: 0.34 },
  { minDamage: 1, color: [150, 150, 230], alpha: 0.22 },
];
export const BOMB_DAMAGE_LETHAL_BAND = BOMB_DAMAGE_BANDS[0];

export function getBombDamageBand(damage: number): BombDamageBand | undefined {
  return BOMB_DAMAGE_BANDS.find((band) => damage >= band.minDamage);
}

export function toRgba([red, green, blue]: number[], alpha: number) {
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
