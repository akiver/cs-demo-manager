import { useVideosState } from './use-videos-state';

export function useVideos() {
  const state = useVideosState();

  return [...state.videos].sort((videoA, videoB) => {
    return new Date(videoA.date).getTime() - new Date(videoB.date).getTime();
  });
}
