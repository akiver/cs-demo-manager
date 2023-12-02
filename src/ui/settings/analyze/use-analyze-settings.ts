import { useSettings } from '../use-settings';

export function useAnalyzeSettings() {
  const settings = useSettings();

  return settings.analyze;
}
