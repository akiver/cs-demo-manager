export const VideoStatus = {
  Pending: 'pending',
  Recording: 'recording',
  MovingFiles: 'moving-files',
  Converting: 'converting',
  Concatenating: 'concatenating',
  Success: 'success',
  Error: 'error',
} as const;

export type VideoStatus = (typeof VideoStatus)[keyof typeof VideoStatus];
