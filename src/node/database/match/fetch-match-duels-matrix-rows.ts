import { sql } from 'kysely';
import { db } from '../database';
import type { DuelMatrixRow } from 'csdm/common/types/duel-matrix-row';

// Example for a 2v2 match:
//
// killerSteamId,killerName,killerTeamSide,victimSteamId,victimName,victimTeamSide,killCount,deathCount
// 11111111111111111,Player-1,2,33333333333333333,Player-3,3,1,2
// 11111111111111111,Player-1,2,44444444444444444,Player-4,3,2,0
// 22222222222222222,Player-2,2,33333333333333333,Player-3,3,3,4
// 22222222222222222,Player-2,2,44444444444444444,Player-4,3,1,2
// 33333333333333333,Player-3,3,11111111111111111,Player-1,2,4,2
// 33333333333333333,Player-3,3,22222222222222222,Player-2,2,1,3
// 44444444444444444,Player-4,3,11111111111111111,Player-1,2,2,5
// 44444444444444444,Player-4,3,22222222222222222,Player-2,2,2,0
export async function fetchMatchDuelsMatrixRows(checksum: string): Promise<DuelMatrixRow[]> {
  const result = await db
    .selectFrom('players as p1')
    .leftJoin('steam_account_overrides as p1_overrides', 'p1.steam_id', 'p1_overrides.steam_id')
    .innerJoin('teams as t1', (eb) => {
      return eb.onRef('p1.match_checksum', '=', 't1.match_checksum').onRef('p1.team_name', '=', 't1.name');
    })
    .innerJoin('players as p2', 'p1.match_checksum', 'p2.match_checksum')
    .leftJoin('steam_account_overrides as p2_overrides', 'p2.steam_id', 'p2_overrides.steam_id')
    .innerJoin('teams as t2', (eb) => {
      return eb.onRef('p2.match_checksum', '=', 't2.match_checksum').onRef('p2.team_name', '=', 't2.name');
    })
    .leftJoin('kills as k', (eb) => {
      return eb
        .onRef('p1.steam_id', '=', 'k.killer_steam_id')
        .onRef('p2.steam_id', '=', 'k.victim_steam_id')
        .on('k.match_checksum', '=', checksum);
    })
    .leftJoin('kills as k2', (eb) => {
      return eb
        .onRef('p2.steam_id', '=', 'k2.killer_steam_id')
        .onRef('p1.steam_id', '=', 'k2.victim_steam_id')
        .on('k2.match_checksum', '=', checksum);
    })
    .where('p2.match_checksum', '=', checksum)
    .whereRef('p1.team_name', '!=', 'p2.team_name')
    .select([
      'p1.steam_id as killerSteamId',
      (eb) => {
        return eb.fn.coalesce('p1_overrides.name', 'p1.name').as('killerName');
      },
      't1.current_side as killerTeamSide',
      'p2.steam_id as victimSteamId',
      (eb) => {
        return eb.fn.coalesce('p2_overrides.name', 'p2.name').as('victimName');
      },
      't2.current_side as victimTeamSide',
      sql<number>`COUNT(DISTINCT k.id)`.as('killCount'),
      sql<number>`COUNT(DISTINCT k2.id)`.as('deathCount'),
    ])
    .groupBy([
      'p1.steam_id',
      'p1.team_name',
      'killerName',
      't1.current_side',
      'p2.steam_id',
      'p2.team_name',
      'victimName',
      't2.current_side',
    ])
    .orderBy('p1.team_name')
    .orderBy('killerName')
    .orderBy('p1.steam_id')
    .orderBy('p2.team_name')
    .orderBy('victimName')
    .orderBy('p2.steam_id')
    .execute();

  return result;
}
