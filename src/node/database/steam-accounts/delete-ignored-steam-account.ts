import { db } from 'csdm/node/database/database';

export async function deleteIgnoredSteamAccount(steamId: string) {
  await db.deleteFrom('ignored_steam_accounts').where('steam_id', '=', steamId).execute();
}
