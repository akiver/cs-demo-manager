import { useFfmpegState } from 'csdm/ui/match/video/ffmpeg/use-ffmpeg-state';

export function useIsFfmpegInstalled(): boolean {
  const ffmpegState = useFfmpegState();

  return ffmpegState.version !== undefined;
}
