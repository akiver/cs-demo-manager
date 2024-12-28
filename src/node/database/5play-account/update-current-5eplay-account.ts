import { db } from 'csdm/node/database/database';

export async function updateCurrent5EPlayAccount(accountId: string) {
  await db.transaction().execute(async (transaction) => {
    await transaction
      .updateTable('5eplay_accounts')
      .set({
        is_current: false,
      })
      .where('id', '<>', accountId)
      .execute();
    await transaction
      .updateTable('5eplay_accounts')
      .set({
        is_current: true,
      })
      .where('id', '=', accountId)
      .execute();
  });
}
