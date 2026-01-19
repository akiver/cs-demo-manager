export const DisplayMode = {
  Windowed: 'windowed',
  Fullscreen: 'fullscreen',
  FullscreenWindowed: 'fullscreen-windowed',
} as const;

export type DisplayMode = (typeof DisplayMode)[keyof typeof DisplayMode];
