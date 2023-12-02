import { useSettings } from '../use-settings';

export function useDatabaseSettings() {
  const settings = useSettings();

  return settings.database;
}
