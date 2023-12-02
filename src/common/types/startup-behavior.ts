export const StartupBehavior = {
  Minimized: 'minimized',
  On: 'on',
  Off: 'off',
} as const;

export type StartupBehavior = (typeof StartupBehavior)[keyof typeof StartupBehavior];
