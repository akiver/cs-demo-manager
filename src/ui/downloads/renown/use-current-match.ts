import { useRenownMatches } from './use-renown-matches';
import { useSelectedMatchId } from './use-selected-match-id';

export function useCurrentMatch() {
  const matches = useRenownMatches();
  const selectedMatchId = useSelectedMatchId();
  const currentMatch = matches.find((match) => {
    return match.id === selectedMatchId;
  });

  if (!currentMatch) {
    throw new Error('Selected match not found');
  }

  return currentMatch;
}
