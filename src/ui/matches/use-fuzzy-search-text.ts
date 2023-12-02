import { useMatchesState } from './use-matches-state';

export function useFuzzySearchText() {
  const state = useMatchesState();

  return state.fuzzySearchText;
}
