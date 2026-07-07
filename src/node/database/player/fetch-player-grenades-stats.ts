import { sql } from 'kysely';
import { roundNumber } from 'csdm/common/math/round-number';
import type { PlayerFlashbangMatchup, PlayerGrenadesStats } from 'csdm/common/types/player-grenades-stats';
import { WeaponName } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';
import { applyMatchFilters, type MatchFilters } from '../match/apply-match-filters';

const fireGrenadeNames = [WeaponName.Molotov, WeaponName.Incendiary];

function toNumber(value: unknown): number {
  return Number(value ?? 0);
}

function average(numerator: number, denominator: number, places = 2): number {
  if (denominator === 0) {
    return 0;
  }

  return roundNumber(numerator / denominator, places);
}

async function fetchPlayerMatchAndRoundCounts(steamId: string, filters: MatchFilters) {
  let query = db
    .selectFrom('players')
    .innerJoin('matches', 'matches.checksum', 'players.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .leftJoin('rounds', 'rounds.match_checksum', 'players.match_checksum')
    .select([
      sql<number>`COUNT(DISTINCT players.match_checksum)`.as('matchCount'),
      sql<number>`COUNT(DISTINCT rounds.id)`.as('roundCount'),
    ])
    .where('players.steam_id', '=', steamId);

  query = applyMatchFilters(query, filters);

  const row = await query.executeTakeFirst();

  return {
    matchCount: toNumber(row?.matchCount),
    roundCount: toNumber(row?.roundCount),
  };
}

async function fetchPlayerGrenadesThrownCounts(steamId: string, filters: MatchFilters) {
  let query = db
    .selectFrom('shots')
    .innerJoin('matches', 'matches.checksum', 'shots.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .select([
      sql<number>`COUNT(*) FILTER (WHERE shots.weapon_name = ${WeaponName.Flashbang})`.as('flashbangsThrownCount'),
      sql<number>`COUNT(*) FILTER (WHERE shots.weapon_name = ${WeaponName.HEGrenade})`.as('heGrenadesThrownCount'),
      sql<number>`COUNT(*) FILTER (WHERE shots.weapon_name = ${WeaponName.Smoke})`.as('smokeGrenadesThrownCount'),
      sql<number>`COUNT(*) FILTER (WHERE shots.weapon_name IN (${sql.join(fireGrenadeNames)}))`.as(
        'fireGrenadesThrownCount',
      ),
    ])
    .where('shots.player_steam_id', '=', steamId)
    .where('shots.is_player_controlling_bot', '=', false);

  query = applyMatchFilters(query, filters);

  const row = await query.executeTakeFirst();

  return {
    flashbangsThrownCount: toNumber(row?.flashbangsThrownCount),
    heGrenadesThrownCount: toNumber(row?.heGrenadesThrownCount),
    smokeGrenadesThrownCount: toNumber(row?.smokeGrenadesThrownCount),
    fireGrenadesThrownCount: toNumber(row?.fireGrenadesThrownCount),
  };
}

async function fetchPlayerFlashbangStats(steamId: string, filters: MatchFilters) {
  let query = db
    .selectFrom('player_blinds')
    .innerJoin('matches', 'matches.checksum', 'player_blinds.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .select([
      sql<number>`COUNT(player_blinds.id)`.as('flashedEnemyCount'),
      sql<number>`COALESCE(SUM(player_blinds.duration), 0)`.as('totalEnemyBlindDuration'),
      sql<number>`COALESCE(AVG(player_blinds.duration), 0)`.as('averageEnemyBlindDuration'),
    ])
    .where('player_blinds.flasher_steam_id', '=', steamId)
    .whereRef('player_blinds.flasher_side', '!=', 'player_blinds.flashed_side')
    .where('player_blinds.is_flasher_controlling_bot', '=', false);

  query = applyMatchFilters(query, filters);

  const row = await query.executeTakeFirst();

  return {
    flashedEnemyCount: toNumber(row?.flashedEnemyCount),
    totalEnemyBlindDuration: roundNumber(toNumber(row?.totalEnemyBlindDuration), 2),
    averageEnemyBlindDuration: roundNumber(toNumber(row?.averageEnemyBlindDuration), 2),
  };
}

async function fetchPlayerGrenadeDamageStats(steamId: string, filters: MatchFilters) {
  let query = db
    .selectFrom('damages')
    .innerJoin('matches', 'matches.checksum', 'damages.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .select([
      sql<number>`COALESCE(SUM(damages.health_damage) FILTER (WHERE damages.weapon_name = ${WeaponName.HEGrenade}), 0)`.as(
        'heDamage',
      ),
      sql<number>`COALESCE(SUM(damages.health_damage) FILTER (WHERE damages.weapon_name IN (${sql.join(
        fireGrenadeNames,
      )})), 0)`.as('fireDamage'),
    ])
    .where('damages.attacker_steam_id', '=', steamId)
    .whereRef('damages.attacker_side', '!=', 'damages.victim_side')
    .where('damages.is_attacker_controlling_bot', '=', false);

  query = applyMatchFilters(query, filters);

  const row = await query.executeTakeFirst();

  return {
    heDamage: toNumber(row?.heDamage),
    fireDamage: toNumber(row?.fireDamage),
  };
}

async function fetchPlayerHeKillCount(steamId: string, filters: MatchFilters) {
  let query = db
    .selectFrom('kills')
    .innerJoin('matches', 'matches.checksum', 'kills.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .select(sql<number>`COUNT(kills.id)`.as('heKillCount'))
    .where('kills.killer_steam_id', '=', steamId)
    .where('kills.weapon_name', '=', WeaponName.HEGrenade)
    .whereRef('kills.killer_side', '!=', 'kills.victim_side')
    .where('kills.is_killer_controlling_bot', '=', false);

  query = applyMatchFilters(query, filters);

  const row = await query.executeTakeFirst();

  return toNumber(row?.heKillCount);
}

async function fetchPlayerFlashbangMatchups(steamId: string, filters: MatchFilters): Promise<PlayerFlashbangMatchup[]> {
  let query = db
    .selectFrom('player_blinds')
    .innerJoin('matches', 'matches.checksum', 'player_blinds.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .leftJoin('steam_account_overrides', 'steam_account_overrides.steam_id', 'player_blinds.flashed_steam_id')
    .select([
      'player_blinds.flashed_steam_id as flashedSteamId',
      (eb) => eb.fn.coalesce('steam_account_overrides.name', 'player_blinds.flashed_name').as('flashedName'),
      sql<number>`COUNT(player_blinds.id)`.as('flashedCount'),
      sql<number>`COALESCE(SUM(player_blinds.duration), 0)`.as('totalDuration'),
      sql<number>`COALESCE(AVG(player_blinds.duration), 0)`.as('averageDuration'),
    ])
    .where('player_blinds.flasher_steam_id', '=', steamId)
    .whereRef('player_blinds.flasher_side', '!=', 'player_blinds.flashed_side')
    .where('player_blinds.is_flasher_controlling_bot', '=', false)
    .groupBy(['player_blinds.flashed_steam_id', 'flashedName'])
    .orderBy('totalDuration', 'desc')
    .limit(20);

  query = applyMatchFilters(query, filters);

  const rows = await query.execute();

  return rows.map((row) => ({
    flashedSteamId: row.flashedSteamId,
    flashedName: row.flashedName,
    flashedCount: toNumber(row.flashedCount),
    totalDuration: roundNumber(toNumber(row.totalDuration), 2),
    averageDuration: roundNumber(toNumber(row.averageDuration), 2),
  }));
}

export async function fetchPlayerGrenadesStats(steamId: string, filters: MatchFilters): Promise<PlayerGrenadesStats> {
  const [counts, throws, flashbangs, damages, heKillCount, flashbangMatchups] = await Promise.all([
    fetchPlayerMatchAndRoundCounts(steamId, filters),
    fetchPlayerGrenadesThrownCounts(steamId, filters),
    fetchPlayerFlashbangStats(steamId, filters),
    fetchPlayerGrenadeDamageStats(steamId, filters),
    fetchPlayerHeKillCount(steamId, filters),
    fetchPlayerFlashbangMatchups(steamId, filters),
  ]);

  return {
    summary: {
      steamId,
      ...counts,
      ...throws,
      ...flashbangs,
      heDamage: damages.heDamage,
      fireDamage: damages.fireDamage,
      heKillCount,
      averageFlashbangsThrownPerMatch: average(throws.flashbangsThrownCount, counts.matchCount),
      averageHeGrenadesThrownPerMatch: average(throws.heGrenadesThrownCount, counts.matchCount),
      averageSmokeGrenadesThrownPerMatch: average(throws.smokeGrenadesThrownCount, counts.matchCount),
      averageFireGrenadesThrownPerMatch: average(throws.fireGrenadesThrownCount, counts.matchCount),
      averageFlashbangsThrownPerRound: average(throws.flashbangsThrownCount, counts.roundCount),
      averageHeGrenadesThrownPerRound: average(throws.heGrenadesThrownCount, counts.roundCount),
      averageSmokeGrenadesThrownPerRound: average(throws.smokeGrenadesThrownCount, counts.roundCount),
      averageFireGrenadesThrownPerRound: average(throws.fireGrenadesThrownCount, counts.roundCount),
      averageFlashedEnemiesPerFlashbang: average(flashbangs.flashedEnemyCount, throws.flashbangsThrownCount),
      averageFlashedEnemiesPerMatch: average(flashbangs.flashedEnemyCount, counts.matchCount),
      averageHeDamagePerThrow: average(damages.heDamage, throws.heGrenadesThrownCount),
      averageHeDamagePerMatch: average(damages.heDamage, counts.matchCount),
      averageFireDamagePerThrow: average(damages.fireDamage, throws.fireGrenadesThrownCount),
      averageFireDamagePerMatch: average(damages.fireDamage, counts.matchCount),
    },
    flashbangMatchups,
  };
}
