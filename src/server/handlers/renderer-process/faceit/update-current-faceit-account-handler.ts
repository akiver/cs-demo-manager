import { fetchFaceitAccounts } from 'csdm/node/database/faceit-account/fetch-faceit-accounts';
import { updateCurrentFaceitAccount } from 'csdm/node/database/faceit-account/update-current-faceit-account';
import { handleError } from '../../handle-error';

export async function updateCurrentFaceitAccountHandler(accountId: string) {
  try {
    await updateCurrentFaceitAccount(accountId);
    const accounts = await fetchFaceitAccounts();

    return accounts;
  } catch (error) {
    handleError(error, `Error while updating current FACEIT account with id ${accountId}`);
  }
}
