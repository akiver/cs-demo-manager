import { useRenownState } from './use-renown-state';

export function useSelectedMatchId() {
  const state = useRenownState();

  return state.selectedMatchId;
}
