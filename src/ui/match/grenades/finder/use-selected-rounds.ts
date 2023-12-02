import { useGrenadesFinderState } from './use-grenades-finder-state';

export function useSelectedRounds() {
  const state = useGrenadesFinderState();

  return state.rounds;
}
