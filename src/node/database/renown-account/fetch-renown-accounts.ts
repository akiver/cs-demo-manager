import { db } from 'csdm/node/database/database';
import { renownAccountRowToRenownAccount } from './renown-account-row-to-renown-account';

export async function fetchRenownAccounts() {
  const rows = await db.selectFrom('renown_accounts').selectAll().orderBy('nickname').execute();
  const accounts = rows.map(renownAccountRowToRenownAccount);

  return accounts;
}
