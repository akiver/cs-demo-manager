import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import { GameMode, WeaponName } from 'csdm/common/types/counter-strike';
import { applyPlayerFilters, type FetchPlayerFilters } from '../player/fetch-player-filters';

export type PlayerUtilityStats = {
  steamId: string;
  averageBlindTime: number;
  averageEnemiesFlashed: number;
  averageHeGrenadeDamage: number;
  averageSmokesThrownPerMatch: number;
};

// Returns on average how long in seconds enemies stay blind because of flashbangs thrown by the player.
async function fetchAverageBlindTime(steamId: string, filters?: FetchPlayerFilters) {
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
        .select(['player_blinds.match_checksum', 'player_blinds.duration'])
        .distinct()
        .where('player_blinds.flasher_steam_id', '=', steamId)
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
    .select(() => {
      return [sql<number>`ROUND(AVG(blinds.duration)::numeric, 1)`.as('average_duration')];
    })
    .leftJoin('matches', 'matches.checksum', 'blinds.match_checksum');

  if (filters) {
    query = applyPlayerFilters(query, filters);
  }

  const row = await query.executeTakeFirst();

  return row?.average_duration ?? 0;
}

// Returns on average how many enemies are flashed by a single flashbang thrown by the player.
// A player is considered flashed if the blind duration is greater than 1 second to exclude half-blind enemies.
async function fetchAverageEnemiesFlashed(steamId: string, filters?: FetchPlayerFilters) {
  const query = db
    .with('enemies_flashed', (db) => {
      let subQuery = db
        .selectFrom('player_blinds')
        .leftJoin('matches', 'matches.checksum', 'player_blinds.match_checksum')
        .select(({ fn }) => ['flasher_steam_id', fn.count('player_blinds.id').as('flashed_count')])
        .where('flasher_steam_id', '=', steamId)
        .whereRef('player_blinds.flasher_side', '!=', 'player_blinds.flashed_side')
        .where('player_blinds.is_flasher_controlling_bot', '=', false)
        .where('player_blinds.duration', '>', 1)
        .where('matches.game_mode_str', '!=', GameMode.Scrimmage2V2)
        .groupBy('flasher_steam_id');

      if (filters) {
        subQuery = applyPlayerFilters(subQuery, filters);
      }

      return subQuery;
    })
    .with('flashbangs_thrown', (db) => {
      let subQuery = db
        .selectFrom('shots')
        .select(({ fn }) => [fn.count('id').as('total_count')])
        .leftJoin('matches', 'matches.checksum', 'shots.match_checksum')
        .where('player_steam_id', '=', steamId)
        .where('shots.weapon_name', '=', WeaponName.Flashbang)
        .where('shots.is_player_controlling_bot', '=', false)
        .where('matches.game_mode_str', '!=', GameMode.Scrimmage2V2);

      if (filters) {
        subQuery = applyPlayerFilters(subQuery, filters);
      }

      return subQuery;
    })
    .selectFrom(['enemies_flashed', 'flashbangs_thrown'])
    .select(() => [
      sql<number>`ROUND((flashed_count::NUMERIC / NULLIF(total_count, 0)::NUMERIC), 1)`.as('average_enemies_flashed'),
    ]);

  const row = await query.executeTakeFirst();

  return row?.average_enemies_flashed ?? 0;
}

// Returns on average how much damage is dealt to enemies by a single HE grenade thrown by the player.
async function fetchAverageHeGrenadeDamage(steamId: string, filters?: FetchPlayerFilters) {
  const query = db
    .with('he_grenades_damages_done', (db) => {
      let subQuery = db
        .selectFrom('damages')
        .select(({ fn }) => ['attacker_steam_id', fn.sum('health_damage').as('total_health_damage')])
        .where('attacker_steam_id', '=', steamId)
        .where('weapon_name', '=', WeaponName.HEGrenade)
        .whereRef('attacker_side', '!=', 'victim_side')
        .where('is_attacker_controlling_bot', '=', false)
        .groupBy('attacker_steam_id')
        .leftJoin('matches', 'matches.checksum', 'damages.match_checksum');

      if (filters) {
        subQuery = applyPlayerFilters(subQuery, filters);
      }

      return subQuery;
    })
    .with('he_grenades_thrown', (db) => {
      let subQuery = db
        .selectFrom('shots')
        .select(({ fn }) => [fn.count('id').as('total_count')])
        .where('player_steam_id', '=', steamId)
        .where('shots.weapon_name', '=', WeaponName.HEGrenade)
        .where('shots.is_player_controlling_bot', '=', false)
        .leftJoin('matches', 'matches.checksum', 'shots.match_checksum');

      if (filters) {
        subQuery = applyPlayerFilters(subQuery, filters);
      }

      return subQuery;
    })
    .selectFrom(['he_grenades_damages_done', 'he_grenades_thrown'])
    .select(
      sql<number>`ROUND((total_health_damage::NUMERIC / NULLIF(total_count, 0)::NUMERIC), 1)`.as('average_damage'),
    );

  const row = await query.executeTakeFirst();

  return row?.average_damage ?? 0;
}

// Returns on average how many smoke grenades are thrown by the player in a single match.
async function fetchAverageSmokesThrownPerMatch(steamId: string, filters?: FetchPlayerFilters) {
  const query = db
    .with('smokes_thrown', (db) => {
      let subQuery = db
        .selectFrom('shots')
        .select(({ fn }) => [fn.count('id').as('total_count')])
        .where('player_steam_id', '=', steamId)
        .where('shots.weapon_name', '=', WeaponName.Smoke)
        .where('shots.is_player_controlling_bot', '=', false)
        .leftJoin('matches', 'matches.checksum', 'shots.match_checksum')
        .where('matches.game_mode_str', '!=', GameMode.Scrimmage2V2)
        .groupBy('match_checksum');

      if (filters) {
        subQuery = applyPlayerFilters(subQuery, filters);
      }

      return subQuery;
    })
    .selectFrom(['smokes_thrown'])
    .select(sql<number>`AVG(total_count)::numeric(10,1)`.as('average_smokes_thrown_per_match'));

  const row = await query.executeTakeFirst();

  return row?.average_smokes_thrown_per_match ?? 0;
}

export async function fetchPlayersUtilityStats(
  steamIds: string[],
  filters?: FetchPlayerFilters,
): Promise<PlayerUtilityStats[]> {
  const results = await Promise.all(
    steamIds.map(async (steamId) => {
      const [averageBlindTime, averageEnemiesFlashed, averageHeGrenadeDamage, averageSmokesThrownPerMatch] =
        await Promise.all([
          fetchAverageBlindTime(steamId, filters),
          fetchAverageEnemiesFlashed(steamId, filters),
          fetchAverageHeGrenadeDamage(steamId, filters),
          fetchAverageSmokesThrownPerMatch(steamId, filters),
        ]);

      return {
        steamId,
        averageBlindTime,
        averageEnemiesFlashed,
        averageHeGrenadeDamage,
        averageSmokesThrownPerMatch,
      };
    }),
  );

  return results;
}
