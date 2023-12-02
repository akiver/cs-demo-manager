import { useVideoState } from 'csdm/ui/match/video/use-video-state';

export function useVirtualDubState() {
  const videoState = useVideoState();

  return videoState.virtualDub;
}
