import { useMatchesState } from './use-matches-state';

export function useSelectedMatches() {
  const state = useMatchesState();

  return state.entities.filter((match) => state.selectedChecksums.includes(match.checksum));
}
