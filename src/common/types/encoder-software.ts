export const EncoderSoftware = {
  VirtualDub: 'VirtualDub',
  FFmpeg: 'FFmpeg',
} as const;

export type EncoderSoftware = (typeof EncoderSoftware)[keyof typeof EncoderSoftware];
