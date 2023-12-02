import { usePlayersState } from './use-players-state';

export function useFuzzySearchText() {
  const state = usePlayersState();

  return state.fuzzySearchText;
}
