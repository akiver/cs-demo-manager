import { useMatchesState } from './use-matches-state';

export function useSelectedMatchChecksums() {
  const state = useMatchesState();

  return state.selectedChecksums;
}
