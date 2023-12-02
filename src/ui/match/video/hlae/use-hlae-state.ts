import type { HlaeState } from 'csdm/ui/match/video/hlae/hlae-reducer';
import { useVideoState } from 'csdm/ui/match/video/use-video-state';

export function useHlaeState(): HlaeState {
  const video = useVideoState();

  return video.hlae;
}
