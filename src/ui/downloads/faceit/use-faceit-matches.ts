import { useFaceitState } from './use-faceit-state';

export function useFaceitMatches() {
  const state = useFaceitState();

  return state.matches;
}
