import { sql } from 'kysely';
import { WeaponType } from 'csdm/common/types/counter-strike';
import { db } from '../database';
import type { TeamFilters } from './team-filters';

export async function fetchTeamCollateralKillCount(filters: TeamFilters) {
  const { count } = db.fn;
  const subQuery = db.with('collateral_kills', (db) => {
    let query = db
      .selectFrom('kills')
      .select(['killer_steam_id', count<number>('tick').as('tick')])
      .leftJoin('matches', 'matches.checksum', 'kills.match_checksum')
      .where('killer_team_name', '=', filters.name)
      .where('weapon_type', 'not in', [WeaponType.Equipment, WeaponType.Grenade, WeaponType.Unknown, WeaponType.World])
      .groupBy(['tick', 'killer_steam_id'])
      .having(count<number>('tick'), '>', 1);

    if (filters.startDate !== undefined && filters.endDate !== undefined) {
      query = query.where(sql<boolean>`matches.date between ${filters.startDate} and ${filters.endDate}`);
    }

    if (filters.demoSources.length > 0) {
      query = query.where('matches.source', 'in', filters.demoSources);
    }

    if (filters.games.length > 0) {
      query = query.where('matches.game', 'in', filters.games);
    }

    if (filters.demoTypes.length > 0) {
      query = query.where('matches.type', 'in', filters.demoTypes);
    }

    if (filters.gameModes.length > 0) {
      query = query.where('matches.game_mode_str', 'in', filters.gameModes);
    }

    if (filters.maxRounds.length > 0) {
      query = query.where('max_rounds', 'in', filters.maxRounds);
    }

    if (filters.tagIds.length > 0) {
      query = query
        .leftJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
        .where('checksum_tags.tag_id', 'in', filters.tagIds);
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
