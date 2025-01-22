export const RecordingOutput = {
  Images: 'images',
  ImagesAndVideo: 'images-and-video',
  Video: 'video',
} as const;

export type RecordingOutput = (typeof RecordingOutput)[keyof typeof RecordingOutput];
