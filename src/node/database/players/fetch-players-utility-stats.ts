import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import { GameMode, WeaponName } from 'csdm/common/types/counter-strike';
import { applyMatchFilters, type MatchFilters } from '../match/apply-match-filters';

export type PlayerUtilityStats = {
  steamId: string;
  averageBlindTime: number;
  averageEnemiesFlashed: number;
  averageHeGrenadeDamage: number;
  averageSmokesThrownPerMatch: number;
};

// Returns on average how long in seconds enemies stay blind because of flashbangs thrown by players.
async function fetchPlayersAverageBlindTime(steamIds: string[], filters?: MatchFilters) {
  let query = db
    .with('max_durations', (db) => {
      return db
        .selectFrom('player_blinds')
        .select(({ fn }) => {
          return ['match_checksum', 'tick', 'flasher_steam_id', fn.max('duration').as('max_duration')];
        })
        .groupBy(['match_checksum', 'tick', 'flasher_steam_id']);
    })
    .with('blinds', (db) =>
      db
        .selectFrom('player_blinds')
        .select(['player_blinds.match_checksum', 'player_blinds.duration', 'player_blinds.flasher_steam_id'])
        .distinct()
        .where((eb) => eb('player_blinds.flasher_steam_id', '=', eb.fn.any(eb.val(steamIds))))
        .whereRef('player_blinds.flasher_side', '!=', 'player_blinds.flashed_side')
        .where('player_blinds.is_flasher_controlling_bot', '=', false)
        .innerJoin('max_durations', function (qb) {
          return qb
            .onRef('max_durations.match_checksum', '=', 'player_blinds.match_checksum')
            .onRef('max_durations.tick', '=', 'player_blinds.tick')
            .onRef('max_durations.flasher_steam_id', '=', 'player_blinds.flasher_steam_id')
            .onRef('max_durations.max_duration', '=', 'player_blinds.duration');
        }),
    )
    .selectFrom('blinds')
    .select('blinds.flasher_steam_id as steamId')
    .select(() => {
      return [sql<number>`ROUND(AVG(blinds.duration)::numeric, 1)`.as('average_duration')];
    })
    .leftJoin('matches', 'matches.checksum', 'blinds.match_checksum')
    .orderBy('steamId')
    .groupBy('blinds.flasher_steam_id');

  if (filters) {
    query = applyMatchFilters(query, filters);
  }

  const rows = await query.execute();

  return rows;
}

// Returns on average how many enemies are flashed by a single flashbang thrown by players.
// A player is considered flashed if the blind duration is greater than 1 second to exclude half-blind enemies.
async function fetchPlayersAverageEnemiesFlashed(steamIds: string[], filters?: MatchFilters) {
  const query = db
    .with('enemies_flashed', (db) => {
      let subQuery = db
        .selectFrom('player_blinds')
        .leftJoin('matches', 'matches.checksum', 'player_blinds.match_checksum')
        .select(({ fn }) => ['flasher_steam_id', fn.count('player_blinds.id').as('flashed_count')])
        .where((eb) => eb('flasher_steam_id', '=', eb.fn.any(eb.val(steamIds))))
        .whereRef('player_blinds.flasher_side', '!=', 'player_blinds.flashed_side')
        .where('player_blinds.is_flasher_controlling_bot', '=', false)
        .where('player_blinds.duration', '>', 1)
        .where('matches.game_mode_str', '!=', GameMode.Scrimmage2V2)
        .groupBy('flasher_steam_id');

      if (filters) {
        subQuery = applyMatchFilters(subQuery, filters);
      }

      return subQuery;
    })
    .with('flashbangs_thrown', (db) => {
      let subQuery = db
        .selectFrom('shots')
        .select('player_steam_id')
        .select(({ fn }) => [fn.count('id').as('total_count')])
        .leftJoin('matches', 'matches.checksum', 'shots.match_checksum')
        .where('player_steam_id', 'in', steamIds)
        .where('shots.weapon_name', '=', WeaponName.Flashbang)
        .where('shots.is_player_controlling_bot', '=', false)
        .where('matches.game_mode_str', '!=', GameMode.Scrimmage2V2)
        .groupBy('player_steam_id');

      if (filters) {
        subQuery = applyMatchFilters(subQuery, filters);
      }

      return subQuery;
    })
    .selectFrom(['enemies_flashed'])
    .select('enemies_flashed.flasher_steam_id as steamId')
    .select(() => [
      sql<number>`ROUND((flashed_count::NUMERIC / NULLIF(total_count, 0)::NUMERIC), 1)`.as('average_enemies_flashed'),
    ])
    .leftJoin('flashbangs_thrown', 'flashbangs_thrown.player_steam_id', 'enemies_flashed.flasher_steam_id')
    .orderBy('steamId');

  const rows = await query.execute();

  return rows;
}

// Returns on average how much damage is dealt to enemies by a single HE grenade thrown by players.
async function fetchPlayersAverageHeGrenadeDamage(steamIds: string[], filters?: MatchFilters) {
  const query = db
    .with('he_grenades_damages_done', (db) => {
      let subQuery = db
        .selectFrom('damages')
        .select(({ fn }) => ['attacker_steam_id', fn.sum('health_damage').as('total_health_damage')])
        .where((eb) => eb('attacker_steam_id', '=', eb.fn.any(eb.val(steamIds))))
        .where('weapon_name', '=', WeaponName.HEGrenade)
        .whereRef('attacker_side', '!=', 'victim_side')
        .where('is_attacker_controlling_bot', '=', false)
        .groupBy('attacker_steam_id')
        .leftJoin('matches', 'matches.checksum', 'damages.match_checksum');

      if (filters) {
        subQuery = applyMatchFilters(subQuery, filters);
      }

      return subQuery;
    })
    .with('he_grenades_thrown', (db) => {
      let subQuery = db
        .selectFrom('shots')
        .select('player_steam_id')
        .select(({ fn }) => [fn.count('id').as('total_count')])
        .where((eb) => eb('player_steam_id', '=', eb.fn.any(eb.val(steamIds))))
        .where('shots.weapon_name', '=', WeaponName.HEGrenade)
        .where('shots.is_player_controlling_bot', '=', false)
        .leftJoin('matches', 'matches.checksum', 'shots.match_checksum')
        .groupBy('player_steam_id');

      if (filters) {
        subQuery = applyMatchFilters(subQuery, filters);
      }

      return subQuery;
    })
    .selectFrom(['he_grenades_damages_done'])
    .select('he_grenades_damages_done.attacker_steam_id as steamId')
    .select(
      sql<number>`ROUND((total_health_damage::NUMERIC / NULLIF(total_count, 0)::NUMERIC), 1)`.as('average_damage'),
    )
    .leftJoin('he_grenades_thrown', 'he_grenades_thrown.player_steam_id', 'he_grenades_damages_done.attacker_steam_id')
    .orderBy('steamId');

  const rows = await query.execute();

  return rows;
}

// Returns on average how many smoke grenades are thrown by players in a single match.
async function fetchPlayersAverageSmokesThrownPerMatch(steamIds: string[], filters?: MatchFilters) {
  const query = db
    .with('smokes_thrown', (db) => {
      let subQuery = db
        .selectFrom('shots')
        .select('shots.player_steam_id')
        .select(({ fn }) => [fn.count('id').as('total_count')])
        .where((eb) => eb('player_steam_id', '=', eb.fn.any(eb.val(steamIds))))
        .where('shots.weapon_name', '=', WeaponName.Smoke)
        .where('shots.is_player_controlling_bot', '=', false)
        .leftJoin('matches', 'matches.checksum', 'shots.match_checksum')
        .where('matches.game_mode_str', '!=', GameMode.Scrimmage2V2)
        .groupBy(['match_checksum', 'shots.player_steam_id']);

      if (filters) {
        subQuery = applyMatchFilters(subQuery, filters);
      }

      return subQuery;
    })
    .selectFrom(['smokes_thrown'])
    .select('smokes_thrown.player_steam_id as steamId')
    .select(sql<number>`AVG(total_count)::numeric(10,1)`.as('average_smokes_thrown_per_match'))
    .orderBy('steamId')
    .groupBy('steamId');

  const rows = await query.execute();

  return rows;
}

export async function fetchPlayersUtilityStats(
  steamIds: string[],
  filters?: MatchFilters,
): Promise<PlayerUtilityStats[]> {
  const [averageBlindTime, averageEnemiesFlashed, averageHeGrenadeDamage, averageSmokesThrownPerMatch] =
    await Promise.all([
      fetchPlayersAverageBlindTime(steamIds, filters),
      fetchPlayersAverageEnemiesFlashed(steamIds, filters),
      fetchPlayersAverageHeGrenadeDamage(steamIds, filters),
      fetchPlayersAverageSmokesThrownPerMatch(steamIds, filters),
    ]);

  const results: PlayerUtilityStats[] = [];
  for (const steamId of steamIds) {
    const blindTimeRow = averageBlindTime.find((row) => row.steamId === steamId);
    const enemiesFlashedRow = averageEnemiesFlashed.find((row) => row.steamId === steamId);
    const heGrenadeDamageRow = averageHeGrenadeDamage.find((row) => row.steamId === steamId);
    const smokesThrownRow = averageSmokesThrownPerMatch.find((row) => row.steamId === steamId);

    results.push({
      steamId,
      averageBlindTime: blindTimeRow?.average_duration ?? 0,
      averageEnemiesFlashed: enemiesFlashedRow?.average_enemies_flashed ?? 0,
      averageHeGrenadeDamage: heGrenadeDamageRow?.average_damage ?? 0,
      averageSmokesThrownPerMatch: smokesThrownRow?.average_smokes_thrown_per_match ?? 0,
    });
  }

  return results;
}
