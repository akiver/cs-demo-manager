import { useVideosState } from './use-videos-state';

export function useVideoQueuePaused() {
  const state = useVideosState();

  return state.isPaused;
}
