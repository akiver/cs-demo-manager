export const VideoFilenamePlaceholder = {
  Map: '{map}',
  Checksum: '{checksum}',
  Game: '{game}',
  Date: '{date}',
  Time: '{time}',
  Encoder: '{encoder}',
  Resolution: '{resolution}',
  Framerate: '{framerate}',
} as const;

export type VideoFilenamePlaceholder = (typeof VideoFilenamePlaceholder)[keyof typeof VideoFilenamePlaceholder];
