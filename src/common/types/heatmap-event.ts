export const HeatmapEvent = {
  Kills: 'kills',
  Deaths: 'deaths',
  Shots: 'shots',
  Positions: 'positions',
  HeGrenade: 'heGrenade',
  Flashbang: 'flashbang',
  Smoke: 'smoke',
  Molotov: 'molotov',
  Decoy: 'decoy',
} as const;

export type HeatmapEvent = (typeof HeatmapEvent)[keyof typeof HeatmapEvent];
