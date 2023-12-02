import { db } from 'csdm/node/database/database';
import { tagRowToTag } from './tag-row-to-tag';

export async function fetchTags() {
  const rows = await db.selectFrom('tags').selectAll().orderBy('name', 'asc').execute();
  const tags = rows.map((row) => {
    return tagRowToTag(row);
  });

  return tags;
}
