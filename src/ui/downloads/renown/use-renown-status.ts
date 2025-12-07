import { useRenownState } from './use-renown-state';

export function useRenownStatus() {
  const state = useRenownState();

  return state.status;
}
