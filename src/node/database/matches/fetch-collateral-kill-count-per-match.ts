import { WeaponType } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';

type CollateralKillCountRow = { collateralKillCount: number; checksum: string };
export type CollateralKillPerMatch = { [checksum: string]: number };

export async function fetchCollateralKillCountPerMatch(checksums?: string[]): Promise<CollateralKillPerMatch> {
  const { count } = db.fn;

  const subQuery = db.with('collateral_kills', (db) => {
    let query = db
      .selectFrom('kills')
      .select(['match_checksum as checksum', count<number>('tick').as('tick')])
      .where('weapon_type', 'not in', [WeaponType.Equipment, WeaponType.Grenade, WeaponType.Unknown, WeaponType.World])
      .groupBy(['tick', 'killer_steam_id', 'match_checksum'])
      .having(count<number>('tick'), '>', 1);

    if (Array.isArray(checksums) && checksums.length > 0) {
      query = query.where('match_checksum', 'in', checksums);
    }

    return query;
  });

  const rows: CollateralKillCountRow[] = await subQuery
    .selectFrom('collateral_kills')
    .select(['checksum', count<number>('checksum').as('collateralKillCount')])
    .groupBy(['tick', 'checksum'])
    .execute();

  const collateralKillCountPerMatch: CollateralKillPerMatch = {};
  for (const row of rows) {
    collateralKillCountPerMatch[row.checksum] = row.collateralKillCount;
  }

  return collateralKillCountPerMatch;
}
