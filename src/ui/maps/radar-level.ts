export const RadarLevel = {
  Upper: 'upper',
  Lower: 'lower',
} as const;

export type RadarLevel = (typeof RadarLevel)[keyof typeof RadarLevel];
