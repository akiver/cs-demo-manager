export const SettingsCategory = {
  Folders: 'folders',
  Database: 'database',
  UI: 'ui',
  Analyze: 'analyze',
  Download: 'download',
  Playback: 'playback',
  Video: 'video',
  Maps: 'maps',
  Tags: 'tags',
  Integrations: 'integrations',
  Ban: 'ban',
  About: 'about',
} as const;

export type SettingsCategory = (typeof SettingsCategory)[keyof typeof SettingsCategory];
