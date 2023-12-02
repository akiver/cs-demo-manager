import type { VideoSettings } from 'csdm/node/settings/settings';
import { useSettings } from '../use-settings';
import { useUpdateSettings } from '../use-update-settings';

export function useVideoSettings() {
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  return {
    settings: settings.video,
    updateSettings: async (settings: DeepPartial<VideoSettings>) => {
      await updateSettings({
        video: settings,
      });
    },
  };
}
