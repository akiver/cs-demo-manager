export const RecordingSystem = {
  CounterStrike: 'CS',
  HLAE: 'HLAE',
} as const;

export type RecordingSystem = (typeof RecordingSystem)[keyof typeof RecordingSystem];
