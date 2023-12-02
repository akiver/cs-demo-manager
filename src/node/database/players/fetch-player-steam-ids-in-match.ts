import { db } from 'csdm/node/database/database';

export async function fetchPlayerSteamIdsInMatch(checksum: string): Promise<string[]> {
  const rows = await db.selectFrom('players').select('steam_id').where('match_checksum', '=', checksum).execute();

  return rows.map((row) => row.steam_id);
}
