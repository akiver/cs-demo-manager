import { db } from 'csdm/node/database/database';

export async function isDemoByPathInDatabase(filePath: string) {
  const row = await db.selectFrom('matches').select('checksum').where('demo_path', '=', filePath).executeTakeFirst();

  return row !== undefined;
}
