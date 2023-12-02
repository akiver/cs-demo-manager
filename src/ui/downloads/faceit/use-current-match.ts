import { useFaceitMatches } from './use-faceit-matches';
import { useSelectedMatchId } from './use-selected-match-id';

export function useCurrentMatch() {
  const matches = useFaceitMatches();
  const selectedMatchId = useSelectedMatchId();
  const currentMatch = matches.find((match) => {
    return match.id === selectedMatchId;
  });

  if (currentMatch === undefined) {
    throw new Error('Selected match not found');
  }

  return currentMatch;
}
