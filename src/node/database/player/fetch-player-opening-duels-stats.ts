import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import { applyMatchFilters, type MatchFilters } from '../match/apply-match-filters';
import { TeamNumber, WeaponName } from 'csdm/common/types/counter-strike';

export type PlayerOpeningDuelsStats = {
  successPercentage: number;
  tradePercentage: number;
  bestWeapon: WeaponName;
};

type PlayerOpeningDuelsStatsPerSide = Record<'ct' | 't' | 'all', PlayerOpeningDuelsStats>;

export async function fetchPlayerOpeningDuelsStats(
  steamId: string,
  filters?: MatchFilters,
): Promise<PlayerOpeningDuelsStatsPerSide> {
  const query = db
    .with('first_kill_per_round', (db) => {
      let subQuery = db
        .selectFrom('kills')
        .select(({ fn }) => {
          return [fn.min('tick').as('first_tick'), 'match_checksum', 'round_number'];
        })
        .leftJoin('matches', 'matches.checksum', 'kills.match_checksum')
        .groupBy(['match_checksum', 'round_number']);

      if (filters) {
        subQuery = applyMatchFilters(subQuery, filters);
      }

      return subQuery;
    })
    .with('opening_duels', (db) => {
      return db
        .selectFrom('kills')
        .select([
          'kills.id',
          'kills.weapon_name',
          sql<number>`CASE WHEN killer_steam_id = ${sql`${steamId}`} THEN 1 ELSE 0 END`.as('is_success'),
          sql<number>`CASE WHEN is_trade_death = true THEN 1 ELSE 0 END`.as('is_traded'),
          sql<number>`CASE WHEN killer_steam_id = ${sql`${steamId}`} THEN killer_side ELSE victim_side END`.as(
            'player_side',
          ),
        ])
        .innerJoin('first_kill_per_round', (qb) => {
          return qb
            .onRef('kills.match_checksum', '=', 'first_kill_per_round.match_checksum')
            .onRef('kills.round_number', '=', 'first_kill_per_round.round_number')
            .onRef('kills.tick', '=', 'first_kill_per_round.first_tick');
        })
        .where(({ eb, or }) => {
          return or([eb('kills.killer_steam_id', '=', steamId), eb('kills.victim_steam_id', '=', steamId)]);
        });
    })
    .with('weapon_stats', (db) => {
      return db
        .selectFrom('opening_duels')
        .select(({ fn }) => {
          return [
            'player_side',
            'weapon_name',
            fn.count('id').as('weapon_kills'),
            sql`ROW_NUMBER() OVER (PARTITION BY player_side ORDER BY COUNT(*) DESC)`.as('rn'),
          ];
        })
        .where('is_success', '=', 1)
        .groupBy(['player_side', 'weapon_name']);
    })
    .selectFrom(['opening_duels'])
    .select([
      'opening_duels.player_side',
      sql<number>`ROUND(SUM(is_success)::numeric / COUNT(*) * 100)`.as('success_percentage'),
      sql<number>`ROUND(SUM(is_traded)::numeric / COUNT(*) * 100)`.as('trade_percentage'),
    ])
    .leftJoin('weapon_stats', 'weapon_stats.player_side', 'opening_duels.player_side')
    .select([sql`MAX(CASE WHEN weapon_stats.rn = 1 THEN weapon_stats.weapon_name END)`.as('best_weapon')])
    .groupBy(['opening_duels.player_side'])
    .unionAll((eb) => {
      return eb
        .selectFrom('opening_duels')
        .leftJoin('weapon_stats', 'weapon_stats.player_side', 'opening_duels.player_side')
        .select([
          sql<number>`0`.as('player_side'),
          sql<number>`ROUND(SUM(is_success)::numeric / COUNT(*) * 100)`.as('success_percentage'),
          sql<number>`ROUND(SUM(is_traded)::numeric / COUNT(*) * 100)`.as('trade_percentage'),
          eb
            .selectFrom('opening_duels')
            .select('weapon_name')
            .where('is_success', '=', 1)
            .groupBy('weapon_name')
            .orderBy(eb.fn.countAll(), 'desc')
            .limit(1)
            .as('best_weapon'),
        ]);
    });

  const rows = await query.execute();

  const buildTeamResult = (team: TeamNumber): PlayerOpeningDuelsStats => {
    const row = rows.find((row) => row.player_side === team);

    return {
      successPercentage: row?.success_percentage ?? 0,
      tradePercentage: row?.trade_percentage ?? 0,
      bestWeapon: (row?.best_weapon ?? WeaponName.Unknown) as WeaponName,
    };
  };

  return {
    ct: buildTeamResult(TeamNumber.CT),
    t: buildTeamResult(TeamNumber.T),
    all: buildTeamResult(TeamNumber.UNASSIGNED),
  };
}
