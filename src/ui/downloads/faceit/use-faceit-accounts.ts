import { useFaceitState } from './use-faceit-state';

export function useFaceitAccounts() {
  const state = useFaceitState();

  return state.accounts;
}
