export const EncoderSoftware = {
  VirtualDub: 'VirtualDub',
  FFmpeg: 'FFmpeg',
} as const;

export type EncoderSoftware = (typeof EncoderSoftware)[keyof typeof EncoderSoftware];

export function isValidEncoderSoftware(value: string): value is EncoderSoftware {
  return Object.values(EncoderSoftware).includes(value as EncoderSoftware);
}
