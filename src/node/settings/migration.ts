import type { Settings } from './settings';

export interface Migration {
  schemaVersion: number;
  run(currentSettings: Settings): Promise<Settings>;
}
