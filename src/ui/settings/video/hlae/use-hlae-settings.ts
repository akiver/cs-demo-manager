import type { HlaeSettings } from 'csdm/node/settings/settings';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';

export function useHlaeSettings() {
  const { settings, updateSettings } = useVideoSettings();

  return {
    hlaeSettings: settings.hlae,
    updateHlaeSettings: async (hlaeSettings: DeepPartial<HlaeSettings>) => {
      await updateSettings({
        hlae: hlaeSettings,
      });
    },
  };
}
