import { useFaceitAccounts } from './use-faceit-accounts';

export function useCurrentFaceitAccount() {
  const accounts = useFaceitAccounts();

  return accounts.find((account) => account.isCurrent);
}
