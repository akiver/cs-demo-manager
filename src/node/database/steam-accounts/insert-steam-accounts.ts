import { db } from '../database';
import type { InsertableSteamAccount } from './steam-account-table';

export async function insertSteamAccounts(accounts: InsertableSteamAccount[]) {
  const batchSize = 1000;
  for (let i = 0; i < accounts.length; i += batchSize) {
    const accountsToInsert = accounts.slice(i, i + batchSize);
    await db
      .insertInto('steam_accounts')
      .values(accountsToInsert)
      .onConflict((oc) => {
        return oc.column('steam_id').doUpdateSet({
          name: (b) => b.ref('excluded.name'),
          avatar: (b) => b.ref('excluded.avatar'),
          creation_date: (b) => b.ref('excluded.creation_date'),
          economy_ban: (b) => b.ref('excluded.economy_ban'),
          game_ban_count: (b) => b.ref('excluded.game_ban_count'),
          has_private_profile: (b) => b.ref('excluded.has_private_profile'),
          is_community_banned: (b) => b.ref('excluded.is_community_banned'),
          last_ban_date: (b) => b.ref('excluded.last_ban_date'),
          vac_ban_count: (b) => b.ref('excluded.vac_ban_count'),
        });
      })
      .execute();
  }
}
