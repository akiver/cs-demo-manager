export const ThemeName = {
  Dark: 'dark',
  Light: 'light',
} as const;

export type ThemeName = (typeof ThemeName)[keyof typeof ThemeName];
