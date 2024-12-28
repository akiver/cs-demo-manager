import { use5EPlayAccounts } from './use-5eplay-accounts';

export function useCurrent5EPlayAccount() {
  const accounts = use5EPlayAccounts();

  return accounts.find((account) => account.isCurrent);
}
