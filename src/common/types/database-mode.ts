export const DatabaseMode = {
  // PostgreSQL server bundled with the app, started and stopped by the daemon.
  Embedded: 'embedded',
  // PostgreSQL server installed and managed by the user, possibly on a remote machine.
  External: 'external',
} as const;

export type DatabaseMode = (typeof DatabaseMode)[keyof typeof DatabaseMode];
