import { db } from 'csdm/node/database/database';

export async function fetchSteamAccounts(steamIds: string[]) {
  const accounts = await db.selectFrom('steam_accounts').selectAll().where('steam_id', 'in', steamIds).execute();

  return accounts;
}
