import { db } from 'csdm/node/database/database';
import { fetch5EPlayAccounts } from './fetch-5eplay-accounts';
import { updateCurrent5EPlayAccount } from './update-current-5eplay-account';

export async function delete5EPlayAccount(accountId: string) {
  await db.deleteFrom('5eplay_accounts').where('id', '=', accountId).execute();
  const accounts = await fetch5EPlayAccounts();

  if (accounts.length > 0) {
    await updateCurrent5EPlayAccount(accounts[0].id);
  }
}
