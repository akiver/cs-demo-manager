export const VideoContainer = {
  AVI: 'avi',
  MP4: 'mp4',
  MKV: 'mkv',
} as const;

export type VideoContainer = (typeof VideoContainer)[keyof typeof VideoContainer];
