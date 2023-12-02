import { useFaceitState } from './use-faceit-state';

export function useSelectedMatchId() {
  const state = useFaceitState();

  return state.selectedMatchId;
}
