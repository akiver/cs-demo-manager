import { db } from 'csdm/node/database/database';

export async function deleteDemos(checksums: string[]) {
  await db.transaction().execute(async (transaction) => {
    await Promise.all([
      transaction.deleteFrom('demos').where('checksum', 'in', checksums).execute(),
      transaction.deleteFrom('demo_paths').where('demo_paths.checksum', 'in', checksums).execute(),
    ]);
  });
}
