export const RecordingSystem = {
  CounterStrike: 'CS',
  HLAE: 'HLAE',
} as const;

export type RecordingSystem = (typeof RecordingSystem)[keyof typeof RecordingSystem];

export function isValidRecordingSystem(value: string): value is RecordingSystem {
  return Object.values(RecordingSystem).includes(value as RecordingSystem);
}
