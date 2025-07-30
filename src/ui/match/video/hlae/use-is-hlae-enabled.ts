import { RecordingSystem } from 'csdm/common/types/recording-system';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';

export function useIsHlaeEnabled() {
  const { settings } = useVideoSettings();

  return settings.recordingSystem === RecordingSystem.HLAE;
}
