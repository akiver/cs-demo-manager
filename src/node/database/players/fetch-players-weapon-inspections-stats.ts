import { db } from '../database';

type PlayerWeaponInspectionsStats = {
  steamId: string;
  deathWhileInspectingWeaponCount: number;
};

export async function fetchPlayersWeaponInspectionsStats(
  checksums: string[],
  steamIds: string[],
): Promise<PlayerWeaponInspectionsStats[]> {
  let query = db
    .selectFrom('kills')
    .select('victim_steam_id as steamId')
    .select(db.fn.count<number>('id').as('deathWhileInspectingWeaponCount'))
    .where('kills.is_victim_inspecting_weapon', '=', true)
    .groupBy('victim_steam_id');

  if (checksums.length > 0) {
    query = query.where('kills.match_checksum', 'in', checksums);
  }

  if (steamIds.length > 0) {
    query = query.where('kills.victim_steam_id', 'in', steamIds);
  }

  const rows = await query.execute();

  return rows;
}
