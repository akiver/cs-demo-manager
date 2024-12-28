import { use5EPlayState } from './use-5eplay-state';

export function use5EPlayAccounts() {
  const state = use5EPlayState();

  return state.accounts;
}
