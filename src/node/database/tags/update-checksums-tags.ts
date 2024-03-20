import { db } from 'csdm/node/database/database';
import type { ChecksumTagRow } from 'csdm/node/database/tags/checksum-tag-table';
import { uniqueArray } from 'csdm/common/array/unique-array';

export async function updateChecksumsTags(checksums: string[], tagIds: string[]) {
  const uniqueTagIds = uniqueArray(tagIds);
  if (uniqueTagIds.length === 0) {
    return;
  }

  const rows: ChecksumTagRow[] = [];
  for (const checksum of checksums) {
    for (const tagId of uniqueTagIds) {
      rows.push({
        checksum,
        tag_id: tagId,
      });
    }
  }

  await db.transaction().execute(async (transaction) => {
    await transaction
      .deleteFrom('checksum_tags')
      .where('checksum', 'in', checksums)
      .where('tag_id', 'not in', uniqueTagIds)
      .execute();

    await transaction
      .insertInto('checksum_tags')
      .values(rows)
      .onConflict((oc) => {
        return oc.columns(['checksum', 'tag_id']).doNothing();
      })
      .execute();
  });
}
