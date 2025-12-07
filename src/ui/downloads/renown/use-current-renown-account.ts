import { useRenownAccounts } from './use-renown-accounts';

export function useCurrentRenownAccount() {
  const accounts = useRenownAccounts();

  return accounts.find((account) => account.isCurrent);
}
