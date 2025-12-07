import { useRenownState } from './use-renown-state';

export function useRenownAccounts() {
  const state = useRenownState();

  return state.accounts;
}
