import { db } from 'csdm/node/database/database';
import type { ChecksumTagRow } from './checksum-tag-table';

export async function fetchChecksumTags() {
  const rows: ChecksumTagRow[] = await db.selectFrom('checksum_tags').selectAll().execute();

  return rows;
}
