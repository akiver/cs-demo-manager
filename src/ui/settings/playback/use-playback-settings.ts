import type { PlaybackSettings } from 'csdm/node/settings/settings';
import { useSettings } from '../use-settings';
import { useUpdateSettings } from '../use-update-settings';

export function usePlaybackSettings() {
  const { playback } = useSettings();
  const updateSettings = useUpdateSettings();

  return {
    updateSettings: (playback?: DeepPartial<PlaybackSettings>) => {
      return updateSettings({
        playback,
      });
    },
    ...playback,
    customCs2LocationEnabled: playback.customCs2LocationEnabled ?? false,
    cs2ExecutablePath: playback.cs2ExecutablePath ?? '',
    customCsgoLocationEnabled: playback.customCsgoLocationEnabled ?? false,
    csgoExecutablePath: playback.csgoExecutablePath ?? '',
  };
}
