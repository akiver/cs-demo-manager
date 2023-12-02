import { useMatches } from './use-matches';
import { useSelectedMatchId } from './use-selected-match-id';

export function useSelectedMatch() {
  const matches = useMatches();
  const selectedMatchId = useSelectedMatchId();

  const selectedMatch = matches.find((match) => match.id === selectedMatchId);
  if (selectedMatch === undefined) {
    throw new Error('Selected Valve match not defined');
  }

  return selectedMatch;
}
