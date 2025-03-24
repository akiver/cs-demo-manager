import { WeaponType } from 'csdm/common/types/counter-strike';
import { db } from '../database';
import { applyMatchFilters, type MatchFilters } from '../match/apply-match-filters';

export async function fetchPlayerCollateralKillCount(steamId: string, filters?: MatchFilters) {
  const { count } = db.fn;
  const subQuery = db.with('collateral_kills', (db) => {
    let query = db
      .selectFrom('kills')
      .select(['killer_steam_id', count<number>('tick').as('tick')])
      .leftJoin('matches', 'matches.checksum', 'kills.match_checksum')
      .where('killer_steam_id', '=', steamId)
      .where('weapon_type', 'not in', [WeaponType.Equipment, WeaponType.Grenade, WeaponType.Unknown, WeaponType.World])
      .groupBy(['tick', 'killer_steam_id'])
      .having(count<number>('tick'), '>', 1);

    if (filters) {
      query = applyMatchFilters(query, filters);
    }

    return query;
  });

  const result = await subQuery
    .selectFrom('collateral_kills')
    .select([count<number>('killer_steam_id').as('collateralKillCount')])
    .groupBy(['killer_steam_id', 'tick'])
    .executeTakeFirst();

  return result?.collateralKillCount ?? 0;
}
