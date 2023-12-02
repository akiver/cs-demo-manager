import { db } from 'csdm/node/database/database';

export async function fetchChecksumTagIds(checksum: string) {
  const rows = await db
    .selectFrom('tags')
    .select('tags.id')
    .leftJoin('checksum_tags', 'checksum_tags.tag_id', 'tags.id')
    .where('checksum', '=', checksum)
    .execute();
  const tagIds = rows.map((row) => {
    return String(row.id);
  });

  return tagIds;
}
