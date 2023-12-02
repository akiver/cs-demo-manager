import fs from 'fs-extra';
import { db } from 'csdm/node/database/database';
import type { DemoPathRow } from './demo-path-table';

export async function deleteOrphanDemos() {
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
    const checksums = demosToDelete.map((row) => row.checksum);
    const paths = demosToDelete.map((row) => row.file_path);
    await db.transaction().execute(async (transaction) => {
      await Promise.all([
        transaction.deleteFrom('demo_paths').where('file_path', 'in', paths).execute(),
        transaction.deleteFrom('demos').where('checksum', 'in', checksums).execute(),
      ]);
    });
  }
}
