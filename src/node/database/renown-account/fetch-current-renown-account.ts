import { db } from 'csdm/node/database/database';
import { renownAccountRowToRenownAccount } from './renown-account-row-to-renown-account';

export async function fetchCurrentRenownAccount() {
  const row = await db.selectFrom('renown_accounts').selectAll().where('is_current', '=', true).executeTakeFirst();

  if (!row) {
    return null;
  }

  return renownAccountRowToRenownAccount(row);
}
