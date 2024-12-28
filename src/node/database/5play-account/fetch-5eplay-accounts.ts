import { db } from 'csdm/node/database/database';
import type { FiveEPlayAccount } from 'csdm/common/types/5eplay-account';
import { fiveEPlayAccountRowTo5EPlayAccount } from './5eplay-account-row-to-5eplay-account';

export async function fetch5EPlayAccounts() {
  const rows = await db.selectFrom('5eplay_accounts').selectAll().orderBy('nickname').execute();
  const accounts: FiveEPlayAccount[] = rows.map(fiveEPlayAccountRowTo5EPlayAccount);

  return accounts;
}
