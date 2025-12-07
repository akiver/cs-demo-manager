import { db } from 'csdm/node/database/database';
import { updateCurrentRenownAccount } from './update-current-renown-account';
import { fetchRenownAccounts } from './fetch-renown-accounts';

export async function deleteRenownAccount(steamId: string) {
  await db.deleteFrom('renown_accounts').where('steam_id', '=', steamId).execute();
  const accounts = await fetchRenownAccounts();

  if (accounts.length > 0) {
    await updateCurrentRenownAccount(accounts[0].id);
  }
}
