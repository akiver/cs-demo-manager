import fs from 'fs-extra';
import { db } from 'csdm/node/database/database';
import type { DemoPathRow } from './demo-path-table';

export async function deleteOrphanDemoPaths() {
  const rows: DemoPathRow[] = await db.selectFrom('demo_paths').selectAll().execute();

  const demosToDelete: DemoPathRow[] = [];
  const demoPathExistsPromises = rows.map(async (row) => {
    const demoExists = await fs.pathExists(row.file_path);
    if (!demoExists) {
      demosToDelete.push(row);
    }
  });

  await Promise.all(demoPathExistsPromises);

  if (demosToDelete.length > 0) {
    const paths = demosToDelete.map((row) => row.file_path);
    await db.deleteFrom('demo_paths').where('file_path', 'in', paths).execute();
  }
}
