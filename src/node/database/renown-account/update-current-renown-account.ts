import { db } from 'csdm/node/database/database';

export async function updateCurrentRenownAccount(steamId: string) {
  await db.transaction().execute(async (transaction) => {
    await transaction
      .updateTable('renown_accounts')
      .set({
        is_current: false,
      })
      .where('steam_id', '<>', steamId)
      .execute();
    await transaction
      .updateTable('renown_accounts')
      .set({
        is_current: true,
      })
      .where('steam_id', '=', steamId)
      .execute();
  });
}
