import { useGrenadesFinderState } from './use-grenades-finder-state';

export function useSelectedRadarLevel() {
  const state = useGrenadesFinderState();

  return state.radarLevel;
}
