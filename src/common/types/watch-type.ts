export const WatchType = {
  Lowlights: 'lowlights',
  Highlights: 'highlights',
} as const;

export type WatchType = (typeof WatchType)[keyof typeof WatchType];
