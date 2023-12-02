export const TimestampName = {
  SyncWithSteam: 'SyncWithSteam',
  FfmpegUpdate: 'FfmpegUpdate',
  HlaeUpdate: 'HlaeUpdate',
} as const;

export type TimestampName = (typeof TimestampName)[keyof typeof TimestampName];
