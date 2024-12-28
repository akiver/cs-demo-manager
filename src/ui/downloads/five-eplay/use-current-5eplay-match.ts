import { use5EPlayState } from './use-5eplay-state';

export function useCurrent5EPlayMatch() {
  const { matches, selectedMatchId } = use5EPlayState();
  const currentMatch = matches.find((match) => {
    return match.id === selectedMatchId;
  });

  if (currentMatch === undefined) {
    throw new Error('Selected match not found');
  }

  return currentMatch;
}
