import { db } from 'csdm/node/database/database';

export async function insertOrUpdatePlayerComment(steamId: string, comment: string) {
  await db
    .insertInto('player_comments')
    .values({
      steam_id: steamId,
      comment,
    })
    .onConflict((oc) => {
      return oc.column('steam_id').doUpdateSet({
        comment: (b) => b.ref('excluded.comment'),
      });
    })
    .execute();
}
