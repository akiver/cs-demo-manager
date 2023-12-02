import { db } from 'csdm/node/database/database';
import { faceitAccountRowToFaceitAccount } from './faceit-account-row-to-faceit-account';

export async function fetchCurrentFaceitAccount() {
  const row = await db.selectFrom('faceit_accounts').selectAll().where('is_current', '=', true).executeTakeFirst();

  if (row === undefined) {
    return undefined;
  }

  return faceitAccountRowToFaceitAccount(row);
}
