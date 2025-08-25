export const RecordingOutput = {
  Images: 'images',
  ImagesAndVideo: 'images-and-video',
  Video: 'video',
} as const;

export type RecordingOutput = (typeof RecordingOutput)[keyof typeof RecordingOutput];

export function isValidRecordingOutput(value: string): value is RecordingOutput {
  return Object.values(RecordingOutput).includes(value as RecordingOutput);
}
