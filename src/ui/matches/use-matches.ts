import { useMatchesState } from './use-matches-state';

export function useMatches() {
  const state = useMatchesState();

  return state.entities;
}
