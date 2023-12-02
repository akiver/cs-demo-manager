import { db } from 'csdm/node/database/database';

export async function updateMatchDemoLocation(checksum: string, demoPath: string) {
  const sanitizedDemoPath = demoPath.replaceAll('\\', '/');
  await db
    .updateTable('matches')
    .set({
      demo_path: sanitizedDemoPath,
    })
    .where('checksum', '=', checksum)
    .execute();
}
