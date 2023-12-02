export const Status = {
  Idle: 'idle',
  Loading: 'loading',
  Success: 'success',
  Error: 'error',
} as const;

export type Status = (typeof Status)[keyof typeof Status];
