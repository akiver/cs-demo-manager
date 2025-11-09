import { db } from 'csdm/node/database/database';

export async function insertOrUpdateRoundComment(checksum: string, number: number, comment: string) {
  await db
    .insertInto('round_comments')
    .values({
      match_checksum: checksum,
      number,
      comment,
    })
    .onConflict((oc) => {
      return oc.columns(['match_checksum', 'number']).doUpdateSet({
        comment: (b) => b.ref('excluded.comment'),
      });
    })
    .execute();
}
