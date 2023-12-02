import { useSettings } from './use-settings';

export function usePinnedPlayerSteamId() {
  const settings = useSettings();

  return settings.pinnedPlayerSteamId;
}
