import { handleError } from '../../handle-error';
import { deleteRenownAccount } from 'csdm/node/database/renown-account/delete-renown-account';
import { fetchRenownAccounts } from 'csdm/node/database/renown-account/fetch-renown-accounts';

export async function deleteRenownAccountHandler(steamId: string) {
  try {
    await deleteRenownAccount(steamId);
    const accounts = await fetchRenownAccounts();

    return accounts;
  } catch (error) {
    handleError(error, `Error while deleting Renown account with Steam ID ${steamId}`);
  }
}
