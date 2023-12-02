import { useVideoState } from 'csdm/ui/match/video/use-video-state';
import type { FfmpegState } from './ffmpeg-reducer';

export function useFfmpegState(): FfmpegState {
  const videoState = useVideoState();

  return videoState.ffmpeg;
}
