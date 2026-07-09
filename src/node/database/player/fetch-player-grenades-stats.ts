import { sql } from 'kysely';
import { roundNumber } from 'csdm/common/math/round-number';
import type {
  FlashbangPlayerRelation,
  PlayerFlashbangMatchup,
  PlayerGrenadesStats,
} from 'csdm/common/types/player-grenades-stats';
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
      sql<number>`COUNT(player_blinds.id) FILTER (WHERE player_blinds.flasher_side != player_blinds.flashed_side)`.as(
        'flashedEnemyCount',
      ),
      sql<number>`COUNT(player_blinds.id) FILTER (WHERE player_blinds.flasher_side = player_blinds.flashed_side)`.as(
        'flashedTeammateCount',
      ),
      sql<number>`COALESCE(SUM(player_blinds.duration) FILTER (WHERE player_blinds.flasher_side != player_blinds.flashed_side), 0)`.as(
        'totalEnemyBlindDuration',
      ),
      sql<number>`COALESCE(SUM(player_blinds.duration) FILTER (WHERE player_blinds.flasher_side = player_blinds.flashed_side), 0)`.as(
        'totalTeammateBlindDuration',
      ),
      sql<number>`COALESCE(AVG(player_blinds.duration) FILTER (WHERE player_blinds.flasher_side != player_blinds.flashed_side), 0)`.as(
        'averageEnemyBlindDuration',
      ),
      sql<number>`COALESCE(AVG(player_blinds.duration) FILTER (WHERE player_blinds.flasher_side = player_blinds.flashed_side), 0)`.as(
        'averageTeammateBlindDuration',
      ),
    ])
    .where('player_blinds.flasher_steam_id', '=', steamId)
    .where('player_blinds.is_flasher_controlling_bot', '=', false);

  query = applyMatchFilters(query, filters);

  const row = await query.executeTakeFirst();

  return {
    flashedEnemyCount: toNumber(row?.flashedEnemyCount),
    flashedTeammateCount: toNumber(row?.flashedTeammateCount),
    totalEnemyBlindDuration: roundNumber(toNumber(row?.totalEnemyBlindDuration), 2),
    totalTeammateBlindDuration: roundNumber(toNumber(row?.totalTeammateBlindDuration), 2),
    averageEnemyBlindDuration: roundNumber(toNumber(row?.averageEnemyBlindDuration), 2),
    averageTeammateBlindDuration: roundNumber(toNumber(row?.averageTeammateBlindDuration), 2),
  };
}

async function fetchPlayerIncomingFlashbangStats(steamId: string, filters: MatchFilters) {
  let query = db
    .selectFrom('player_blinds')
    .innerJoin('matches', 'matches.checksum', 'player_blinds.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .select([
      sql<number>`COUNT(player_blinds.id) FILTER (WHERE player_blinds.flasher_side != player_blinds.flashed_side)`.as(
        'flashedByEnemyCount',
      ),
      sql<number>`COUNT(player_blinds.id) FILTER (WHERE player_blinds.flasher_side = player_blinds.flashed_side)`.as(
        'flashedByTeammateCount',
      ),
      sql<number>`COALESCE(SUM(player_blinds.duration) FILTER (WHERE player_blinds.flasher_side != player_blinds.flashed_side), 0)`.as(
        'totalBlindDurationFromEnemies',
      ),
      sql<number>`COALESCE(SUM(player_blinds.duration) FILTER (WHERE player_blinds.flasher_side = player_blinds.flashed_side), 0)`.as(
        'totalBlindDurationFromTeammates',
      ),
      sql<number>`COALESCE(AVG(player_blinds.duration) FILTER (WHERE player_blinds.flasher_side != player_blinds.flashed_side), 0)`.as(
        'averageBlindDurationFromEnemies',
      ),
      sql<number>`COALESCE(AVG(player_blinds.duration) FILTER (WHERE player_blinds.flasher_side = player_blinds.flashed_side), 0)`.as(
        'averageBlindDurationFromTeammates',
      ),
    ])
    .where('player_blinds.flashed_steam_id', '=', steamId)
    .where('player_blinds.is_flasher_controlling_bot', '=', false);

  query = applyMatchFilters(query, filters);

  const row = await query.executeTakeFirst();

  return {
    flashedByEnemyCount: toNumber(row?.flashedByEnemyCount),
    flashedByTeammateCount: toNumber(row?.flashedByTeammateCount),
    totalBlindDurationFromEnemies: roundNumber(toNumber(row?.totalBlindDurationFromEnemies), 2),
    totalBlindDurationFromTeammates: roundNumber(toNumber(row?.totalBlindDurationFromTeammates), 2),
    averageBlindDurationFromEnemies: roundNumber(toNumber(row?.averageBlindDurationFromEnemies), 2),
    averageBlindDurationFromTeammates: roundNumber(toNumber(row?.averageBlindDurationFromTeammates), 2),
  };
}

async function fetchPlayerGrenadeDamageStats(steamId: string, filters: MatchFilters) {
  let outgoingQuery = db
    .selectFrom('damages')
    .innerJoin('matches', 'matches.checksum', 'damages.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .select([
      sql<number>`COALESCE(SUM(damages.health_damage) FILTER (WHERE damages.weapon_name = ${WeaponName.HEGrenade} AND damages.attacker_side != damages.victim_side), 0)`.as(
        'heDamage',
      ),
      sql<number>`COALESCE(SUM(damages.health_damage) FILTER (WHERE damages.weapon_name = ${WeaponName.HEGrenade} AND damages.attacker_side = damages.victim_side), 0)`.as(
        'heTeammateDamage',
      ),
      sql<number>`COALESCE(SUM(damages.health_damage) FILTER (WHERE damages.weapon_name IN (${sql.join(
        fireGrenadeNames,
      )}) AND damages.attacker_side != damages.victim_side), 0)`.as('fireDamage'),
      sql<number>`COALESCE(SUM(damages.health_damage) FILTER (WHERE damages.weapon_name IN (${sql.join(
        fireGrenadeNames,
      )}) AND damages.attacker_side = damages.victim_side), 0)`.as('fireTeammateDamage'),
    ])
    .where('damages.attacker_steam_id', '=', steamId)
    .where('damages.is_attacker_controlling_bot', '=', false);

  outgoingQuery = applyMatchFilters(outgoingQuery, filters);

  let incomingQuery = db
    .selectFrom('damages')
    .innerJoin('matches', 'matches.checksum', 'damages.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .select([
      sql<number>`COALESCE(SUM(damages.health_damage) FILTER (WHERE damages.weapon_name = ${WeaponName.HEGrenade} AND damages.attacker_side != damages.victim_side), 0)`.as(
        'heDamageTakenFromEnemies',
      ),
      sql<number>`COALESCE(SUM(damages.health_damage) FILTER (WHERE damages.weapon_name = ${WeaponName.HEGrenade} AND damages.attacker_side = damages.victim_side), 0)`.as(
        'heDamageTakenFromTeammates',
      ),
      sql<number>`COALESCE(SUM(damages.health_damage) FILTER (WHERE damages.weapon_name IN (${sql.join(
        fireGrenadeNames,
      )}) AND damages.attacker_side != damages.victim_side), 0)`.as('fireDamageTakenFromEnemies'),
      sql<number>`COALESCE(SUM(damages.health_damage) FILTER (WHERE damages.weapon_name IN (${sql.join(
        fireGrenadeNames,
      )}) AND damages.attacker_side = damages.victim_side), 0)`.as('fireDamageTakenFromTeammates'),
    ])
    .where('damages.victim_steam_id', '=', steamId)
    .where('damages.is_attacker_controlling_bot', '=', false);

  incomingQuery = applyMatchFilters(incomingQuery, filters);

  const [outgoingRow, incomingRow] = await Promise.all([
    outgoingQuery.executeTakeFirst(),
    incomingQuery.executeTakeFirst(),
  ]);

  return {
    heDamage: toNumber(outgoingRow?.heDamage),
    heTeammateDamage: toNumber(outgoingRow?.heTeammateDamage),
    heDamageTakenFromEnemies: toNumber(incomingRow?.heDamageTakenFromEnemies),
    heDamageTakenFromTeammates: toNumber(incomingRow?.heDamageTakenFromTeammates),
    fireDamage: toNumber(outgoingRow?.fireDamage),
    fireTeammateDamage: toNumber(outgoingRow?.fireTeammateDamage),
    fireDamageTakenFromEnemies: toNumber(incomingRow?.fireDamageTakenFromEnemies),
    fireDamageTakenFromTeammates: toNumber(incomingRow?.fireDamageTakenFromTeammates),
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

async function fetchPlayersFlashedByPlayer(steamId: string, filters: MatchFilters): Promise<PlayerFlashbangMatchup[]> {
  const relation = sql<FlashbangPlayerRelation>`CASE WHEN player_blinds.flasher_side != player_blinds.flashed_side THEN 'enemy' ELSE 'teammate' END`;
  let query = db
    .selectFrom('player_blinds')
    .innerJoin('matches', 'matches.checksum', 'player_blinds.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .leftJoin('steam_account_overrides', 'steam_account_overrides.steam_id', 'player_blinds.flashed_steam_id')
    .select([
      'player_blinds.flashed_steam_id as steamId',
      (eb) => eb.fn.coalesce('steam_account_overrides.name', 'player_blinds.flashed_name').as('name'),
      relation.as('relation'),
      sql<number>`COUNT(player_blinds.id)`.as('count'),
      sql<number>`COALESCE(SUM(player_blinds.duration), 0)`.as('totalDuration'),
      sql<number>`COALESCE(AVG(player_blinds.duration), 0)`.as('averageDuration'),
    ])
    .where('player_blinds.flasher_steam_id', '=', steamId)
    .where('player_blinds.is_flasher_controlling_bot', '=', false)
    .groupBy(['player_blinds.flashed_steam_id', 'player_blinds.flashed_name', 'steam_account_overrides.name', relation])
    .orderBy('totalDuration', 'desc')
    .limit(20);

  query = applyMatchFilters(query, filters);

  const rows = await query.execute();

  return rows.map((row) => ({
    steamId: row.steamId,
    name: row.name,
    relation: row.relation,
    count: toNumber(row.count),
    totalDuration: roundNumber(toNumber(row.totalDuration), 2),
    averageDuration: roundNumber(toNumber(row.averageDuration), 2),
  }));
}

async function fetchPlayersWhoFlashedPlayer(steamId: string, filters: MatchFilters): Promise<PlayerFlashbangMatchup[]> {
  const relation = sql<FlashbangPlayerRelation>`CASE WHEN player_blinds.flasher_side != player_blinds.flashed_side THEN 'enemy' ELSE 'teammate' END`;
  let query = db
    .selectFrom('player_blinds')
    .innerJoin('matches', 'matches.checksum', 'player_blinds.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .leftJoin('steam_account_overrides', 'steam_account_overrides.steam_id', 'player_blinds.flasher_steam_id')
    .select([
      'player_blinds.flasher_steam_id as steamId',
      (eb) => eb.fn.coalesce('steam_account_overrides.name', 'player_blinds.flasher_name').as('name'),
      relation.as('relation'),
      sql<number>`COUNT(player_blinds.id)`.as('count'),
      sql<number>`COALESCE(SUM(player_blinds.duration), 0)`.as('totalDuration'),
      sql<number>`COALESCE(AVG(player_blinds.duration), 0)`.as('averageDuration'),
    ])
    .where('player_blinds.flashed_steam_id', '=', steamId)
    .where('player_blinds.is_flasher_controlling_bot', '=', false)
    .groupBy(['player_blinds.flasher_steam_id', 'player_blinds.flasher_name', 'steam_account_overrides.name', relation])
    .orderBy('totalDuration', 'desc')
    .limit(20);

  query = applyMatchFilters(query, filters);

  const rows = await query.execute();

  return rows.map((row) => ({
    steamId: row.steamId,
    name: row.name,
    relation: row.relation,
    count: toNumber(row.count),
    totalDuration: roundNumber(toNumber(row.totalDuration), 2),
    averageDuration: roundNumber(toNumber(row.averageDuration), 2),
  }));
}

export async function fetchPlayerGrenadesStats(steamId: string, filters: MatchFilters): Promise<PlayerGrenadesStats> {
  const [counts, throws, flashbangs, incomingFlashbangs, damages, heKillCount, flashedPlayers, flashedByPlayers] =
    await Promise.all([
      fetchPlayerMatchAndRoundCounts(steamId, filters),
      fetchPlayerGrenadesThrownCounts(steamId, filters),
      fetchPlayerFlashbangStats(steamId, filters),
      fetchPlayerIncomingFlashbangStats(steamId, filters),
      fetchPlayerGrenadeDamageStats(steamId, filters),
      fetchPlayerHeKillCount(steamId, filters),
      fetchPlayersFlashedByPlayer(steamId, filters),
      fetchPlayersWhoFlashedPlayer(steamId, filters),
    ]);

  return {
    summary: {
      steamId,
      ...counts,
      ...throws,
      ...flashbangs,
      ...incomingFlashbangs,
      heDamage: damages.heDamage,
      heTeammateDamage: damages.heTeammateDamage,
      heDamageTakenFromEnemies: damages.heDamageTakenFromEnemies,
      heDamageTakenFromTeammates: damages.heDamageTakenFromTeammates,
      fireDamage: damages.fireDamage,
      fireTeammateDamage: damages.fireTeammateDamage,
      fireDamageTakenFromEnemies: damages.fireDamageTakenFromEnemies,
      fireDamageTakenFromTeammates: damages.fireDamageTakenFromTeammates,
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
      averageFlashedTeammatesPerFlashbang: average(flashbangs.flashedTeammateCount, throws.flashbangsThrownCount),
      averageFlashedEnemiesPerMatch: average(flashbangs.flashedEnemyCount, counts.matchCount),
      averageFlashedTeammatesPerMatch: average(flashbangs.flashedTeammateCount, counts.matchCount),
      averageFlashedByEnemiesPerMatch: average(incomingFlashbangs.flashedByEnemyCount, counts.matchCount),
      averageFlashedByTeammatesPerMatch: average(incomingFlashbangs.flashedByTeammateCount, counts.matchCount),
      averageHeDamagePerThrow: average(damages.heDamage, throws.heGrenadesThrownCount),
      averageHeDamagePerMatch: average(damages.heDamage, counts.matchCount),
      averageHeTeammateDamagePerMatch: average(damages.heTeammateDamage, counts.matchCount),
      averageHeDamageTakenFromEnemiesPerMatch: average(damages.heDamageTakenFromEnemies, counts.matchCount),
      averageHeDamageTakenFromTeammatesPerMatch: average(damages.heDamageTakenFromTeammates, counts.matchCount),
      averageFireDamagePerThrow: average(damages.fireDamage, throws.fireGrenadesThrownCount),
      averageFireDamagePerMatch: average(damages.fireDamage, counts.matchCount),
      averageFireTeammateDamagePerMatch: average(damages.fireTeammateDamage, counts.matchCount),
      averageFireDamageTakenFromEnemiesPerMatch: average(damages.fireDamageTakenFromEnemies, counts.matchCount),
      averageFireDamageTakenFromTeammatesPerMatch: average(damages.fireDamageTakenFromTeammates, counts.matchCount),
    },
    flashedPlayers,
    flashedByPlayers,
  };
}
