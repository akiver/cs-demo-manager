export const HeatmapEvent = {
  Kills: 'kills',
  Deaths: 'deaths',
  Shots: 'shots',
  HeGrenade: 'heGrenade',
  Flashbang: 'flashbang',
  Smoke: 'smoke',
  Molotov: 'molotov',
  Decoy: 'decoy',
} as const;

export type HeatmapEvent = (typeof HeatmapEvent)[keyof typeof HeatmapEvent];
