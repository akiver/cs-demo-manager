import { db } from 'csdm/node/database/database';

export async function insertOrUpdateComment(checksum: string, comment: string) {
  await db
    .insertInto('comments')
    .values({
      checksum,
      comment,
    })
    .onConflict((oc) => {
      return oc.column('checksum').doUpdateSet({
        comment: (b) => b.ref('excluded.comment'),
      });
    })
    .execute();
}
