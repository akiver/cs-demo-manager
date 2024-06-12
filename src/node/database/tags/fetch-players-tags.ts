import { db } from 'csdm/node/database/database';

export async function fetchPlayersTags() {
  const rows = await db.selectFrom('steam_account_tags').selectAll().execute();

  return rows;
}
