import type { Demo } from 'csdm/common/types/demo';
import { db } from 'csdm/node/database/database';
import { fetchChecksumTagIds } from '../tags/fetch-checksum-tag-ids';
import type { DemoRow } from './demo-table';
import { demoRowToDemo } from './demo-row-to-demo';

type QueryResult =
  | (DemoRow & {
      file_path: string;
      comment: string | null;
    })
  | undefined;

export async function fetchDemoByChecksum(checksum: string): Promise<Demo | undefined> {
  const row: QueryResult = await db
    .selectFrom('demos')
    .selectAll()
    .select('demos.checksum as checksum')
    .innerJoin('demo_paths', 'demo_paths.checksum', 'demos.checksum')
    .select('demo_paths.file_path')
    .leftJoin('comments', 'comments.checksum', 'demos.checksum')
    .select('comments.comment')
    .where('demos.checksum', '=', checksum)
    .executeTakeFirst();

  if (row === undefined) {
    return undefined;
  }

  const tagIds = await fetchChecksumTagIds(checksum);
  const demo = demoRowToDemo(row, row.file_path, tagIds, row.comment);

  return demo;
}
