export const VideoContainer = {
  AVI: 'avi',
  MP4: 'mp4',
  MKV: 'mkv',
} as const;

export type VideoContainer = (typeof VideoContainer)[keyof typeof VideoContainer];

export function isValidVideoContainer(value: string): value is VideoContainer {
  return Object.values(VideoContainer).includes(value as VideoContainer);
}
