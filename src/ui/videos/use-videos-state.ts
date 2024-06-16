import { useSelector } from 'csdm/ui/store/use-selector';
import type { VideosState } from './videos-reducer';

export function useVideosState(): VideosState {
  const state = useSelector((state) => state.videos);

  return state;
}
