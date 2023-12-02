import { updateCurrentFaceitAccount } from 'csdm/node/database/faceit-account/update-current-faceit-account';
import { db } from 'csdm/node/database/database';
import { fetchFaceitAccounts } from './fetch-faceit-accounts';

export async function deleteFaceitAccount(accountId: string) {
  await db.deleteFrom('faceit_accounts').where('id', '=', accountId).execute();
  const accounts = await fetchFaceitAccounts();

  if (accounts.length > 0) {
    await updateCurrentFaceitAccount(accounts[0].id);
  }
}
