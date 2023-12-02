import { useSettings } from '../use-settings';

export function useUiSettings() {
  const settings = useSettings();

  return settings.ui;
}
