import { WeaponType } from 'csdm/common/types/counter-strike';
import { db } from '../database';

type CollateralKillCountRow = { collateralKillCount: number; steamId: string };

export async function fetchCollateralKillCountPerSteamId(checksum: string) {
  const { count } = db.fn;
  const subQuery = db.with('collateral_kills', (db) => {
    return db
      .selectFrom('kills')
      .select(['killer_steam_id', count<number>('tick').as('tick')])
      .where('match_checksum', '=', checksum)
      .where('weapon_type', 'not in', [WeaponType.Equipment, WeaponType.Grenade, WeaponType.Unknown, WeaponType.World])
      .groupBy(['tick', 'killer_steam_id'])
      .having(count<number>('tick'), '>', 1)
      .$assertType<{ killer_steam_id: string; tick: number }>();
  });

  const rows: CollateralKillCountRow[] = await subQuery
    .selectFrom('collateral_kills')
    .select(['killer_steam_id as steamId', count<number>('killer_steam_id').as('collateralKillCount')])
    .groupBy('killer_steam_id')
    .execute();

  const collateralKillCountPerSteamId: { [steamId: string]: number } = {};
  for (const row of rows) {
    collateralKillCountPerSteamId[row.steamId] = row.collateralKillCount;
  }

  return collateralKillCountPerSteamId;
}
