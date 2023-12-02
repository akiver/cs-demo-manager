import { db } from 'csdm/node/database/database';
import type { ChecksumTagRow } from 'csdm/node/database/tags/checksum-tag-table';
import { uniqueArray } from 'csdm/common/array/unique-array';

export async function updateChecksumsTags(checksums: string[], tagIds: string[]) {
  const rows: ChecksumTagRow[] = [];
  const uniqueTagIds = uniqueArray(tagIds);
  for (const checksum of checksums) {
    for (const tagId of uniqueTagIds) {
      rows.push({
        checksum,
        tag_id: tagId,
      });
    }
  }

  await db.deleteFrom('checksum_tags').where('checksum', 'in', checksums).execute();
  if (rows.length > 0) {
    await db
      .insertInto('checksum_tags')
      .values(rows)
      .onConflict((oc) => {
        return oc.columns(['checksum', 'tag_id']).doUpdateSet({
          checksum: (b) => b.ref('excluded.checksum'),
          tag_id: (b) => b.ref('excluded.tag_id'),
        });
      })
      .execute();
  }
}
