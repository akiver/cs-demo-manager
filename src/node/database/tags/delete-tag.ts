import { db } from 'csdm/node/database/database';

export async function deleteTag(tagId: string) {
  await db.deleteFrom('tags').where('id', '=', tagId).execute();
}
