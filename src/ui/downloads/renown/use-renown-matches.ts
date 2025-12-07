import { useRenownState } from './use-renown-state';

export function useRenownMatches() {
  const state = useRenownState();

  return state.matches;
}
