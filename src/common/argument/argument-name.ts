export const ArgumentName = {
  StartPath: 'start-path',
  DemoPath: 'demo-path',
  AppOpenedAtLogin: 'app-opened-at-login', // Used to know when the app was opened automatically by the system at login
} as const;

export type ArgumentName = (typeof ArgumentName)[keyof typeof ArgumentName];
