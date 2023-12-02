import { useSettings } from '../use-settings';

export function useWatchSettings() {
  const settings = useSettings();

  return settings.playback;
}
