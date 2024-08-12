import { isEmptyString } from 'csdm/common/string/is-empty-string';
import { db } from '../database';
import { SteamAccountNameTooLong } from './errors/steam-account-name-too-long';

export async function updateSteamAccountName(steamId: string, name: string) {
  const shouldDeleteOverride = isEmptyString(name);
  if (shouldDeleteOverride) {
    await db.deleteFrom('steam_account_overrides').where('steam_id', '=', steamId).execute();

    const defaultNameRow = await db
      .selectFrom('steam_accounts')
      .select(['name'])
      .where('steam_accounts.steam_id', '=', steamId)
      .executeTakeFirst();

    return defaultNameRow?.name ?? name;
  }

  if (name.length > 32) {
    throw new SteamAccountNameTooLong();
  }

  await db
    .insertInto('steam_account_overrides')
    .values({ steam_id: steamId, name })
    .onConflict((oc) => {
      return oc.columns(['steam_id']).doUpdateSet({ name });
    })
    .execute();

  return name;
}
