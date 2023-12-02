export const DatabaseStatus = {
  Idle: 'idle',
  Connected: 'connected',
  Disconnected: 'disconnected',
  Error: 'error',
} as const;

export type DatabaseStatus = (typeof DatabaseStatus)[keyof typeof DatabaseStatus];
