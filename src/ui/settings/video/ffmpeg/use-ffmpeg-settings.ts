import { useVideoSettings } from '../use-video-settings';

export function useFfmpegSettings() {
  const { settings } = useVideoSettings();

  return settings.ffmpegSettings;
}
