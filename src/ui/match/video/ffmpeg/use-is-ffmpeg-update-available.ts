import { useFfmpegState } from 'csdm/ui/match/video/ffmpeg/use-ffmpeg-state';

export function useIsFfmpegUpdateAvailable(): boolean {
  const ffmpegState = useFfmpegState();

  return ffmpegState.isUpdateAvailable;
}
