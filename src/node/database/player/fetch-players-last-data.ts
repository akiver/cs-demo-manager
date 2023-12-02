import { db } from 'csdm/node/database/database';

export async function fetchLastPlayersLastData(steamIds: string[]) {
  const rows = await db
    .selectFrom('players')
    .select(['steam_id as steamId', 'players.name as name', 'rank as rank', 'wins_count as winsCount'])
    .distinctOn('steam_id')
    .leftJoin('matches', 'matches.checksum', 'players.match_checksum')
    .where('steam_id', 'in', steamIds)
    .orderBy('steam_id')
    .orderBy('matches.date', 'desc')
    .execute();
  const lastDataPerSteamId = new Map(rows.map((row) => [row.steamId, row]));

  return lastDataPerSteamId;
}
