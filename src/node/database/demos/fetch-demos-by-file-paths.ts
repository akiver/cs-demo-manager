import type { Demo } from 'csdm/common/types/demo';
import { db } from 'csdm/node/database/database';
import { demoRowToDemo } from './demo-row-to-demo';
import { fetchChecksumTags } from '../tags/fetch-checksum-tags';

export async function fetchDemosByFilePaths(filePaths: string[]): Promise<Demo[]> {
  if (filePaths.length === 0) {
    return [];
  }

  const rows = await db
    .selectFrom('demos')
    .selectAll()
    .innerJoin('demo_paths', 'demo_paths.checksum', 'demos.checksum')
    .select(['demo_paths.file_path', 'demo_paths.checksum'])
    .leftJoin('comments', 'comments.checksum', 'demos.checksum')
    .select('comments.comment')
    .where('demo_paths.file_path', 'in', filePaths)
    .execute();

  const checksumTags = await fetchChecksumTags();
  const demos: Demo[] = [];
  for (const row of rows) {
    const tagIds = checksumTags
      .filter(({ checksum }) => checksum === row.checksum)
      .map((row) => {
        return row.tag_id;
      });
    const demo = demoRowToDemo(row, row.file_path, tagIds, row.comment);
    demos.push(demo);
  }

  return demos;
}
