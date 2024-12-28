import { db } from 'csdm/node/database/database';
import { fiveEPlayAccountRowTo5EPlayAccount } from './5eplay-account-row-to-5eplay-account';

export async function fetchCurrent5EPlayAccount() {
  const row = await db.selectFrom('5eplay_accounts').selectAll().where('is_current', '=', true).executeTakeFirst();

  if (!row) {
    return undefined;
  }

  return fiveEPlayAccountRowTo5EPlayAccount(row);
}
