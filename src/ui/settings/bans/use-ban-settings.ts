import { defaultSettings } from 'csdm/node/settings/default-settings';
import { useSettings } from 'csdm/ui/settings/use-settings';

export function useBanSettings() {
  const settings = useSettings();

  return settings.ban ?? defaultSettings.ban;
}
