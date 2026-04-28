import { db } from 'csdm/node/database/database';

export async function fetchPlayersTagIds(steamIds: string[]) {
  if (steamIds.length === 0) {
    return {};
  }

  const rows = await db
    .selectFrom('steam_account_tags')
    .select(['steam_id as steamId', 'tag_id'])
    .distinct()
    .where('steam_id', 'in', steamIds)
    .execute();

  const tagIdsPerSteamId: { [steamId: string]: string[] } = {};
  for (const row of rows) {
    if (!tagIdsPerSteamId[row.steamId]) {
      tagIdsPerSteamId[row.steamId] = [];
    }
    tagIdsPerSteamId[row.steamId].push(String(row.tag_id));
  }

  return tagIdsPerSteamId;
}
