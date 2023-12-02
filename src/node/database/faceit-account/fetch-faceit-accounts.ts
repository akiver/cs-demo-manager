import { db } from 'csdm/node/database/database';
import type { FaceitAccount } from '../../../common/types/faceit-account';
import { faceitAccountRowToFaceitAccount } from './faceit-account-row-to-faceit-account';

export async function fetchFaceitAccounts() {
  const rows = await db.selectFrom('faceit_accounts').selectAll().orderBy('nickname').execute();
  const accounts: FaceitAccount[] = rows.map(faceitAccountRowToFaceitAccount);

  return accounts;
}
