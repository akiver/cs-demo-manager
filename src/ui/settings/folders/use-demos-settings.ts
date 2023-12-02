import { useSettings } from '../use-settings';

export function useDemosSettings() {
  const settings = useSettings();

  return settings.demos;
}
