import { useGrenadesFinderState } from './use-grenades-finder-state';

export function useSelectedSides() {
  const state = useGrenadesFinderState();

  return state.sides;
}
