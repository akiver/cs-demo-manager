import { db } from 'csdm/node/database/database';

export async function fetchPlayersTagIds(steamIds: string[]) {
  const rows = await db
    .selectFrom('steam_account_tags')
    .select(['tag_id'])
    .distinct()
    .where('steam_id', 'in', steamIds)
    .execute();

  const tagIds = rows.map((row) => {
    return String(row.tag_id);
  });

  return tagIds;
}
