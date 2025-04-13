import { sql } from 'kysely';
import { db } from '../database';
import type { FlashbangMatrixRow } from 'csdm/common/types/flashbang-matrix-row';

// Returns an array of rows that contain how long each player flashed each other player in a given match.
// Each player will have a row for each other player in the match.
// So for a 5v5 it will return 10 * 10 = 100 rows
//
// Example for a 2v2 match:
// flasherSteamId,flasherName,flasherTeamSide,flashedSteamId,flashedName,flashedTeamSide,duration
// 11111111111111111,Player-1,2,11111111111111111,Player-1,2,0.5998
// 11111111111111111,Player-1,2,22222222222222222,Player-2,2,0
// 11111111111111111,Player-1,2,33333333333333333,Player-3,3,4.7329
// 11111111111111111,Player-1,2,44444444444444444,Player-4,3,3.9328
// 22222222222222222,Player-2,2,11111111111111111,Player-1,2,0
// 22222222222222222,Player-2,2,22222222222222222,Player-2,2,0
// 22222222222222222,Player-2,2,33333333333333333,Player-3,3,4.308057
// 22222222222222222,Player-2,2,44444444444444444,Player-4,3,3.999971
// 33333333333333333,Player-3,3,11111111111111111,Player-1,2,3.82103
// 33333333333333333,Player-3,3,22222222222222222,Player-2,2,3.837209
// 33333333333333333,Player-3,3,33333333333333333,Player-3,3,0
// 33333333333333333,Player-3,3,44444444444444444,Player-4,3,1.2361
// 44444444444444444,Player-4,3,11111111111111111,Player-1,2,17.5371
// 44444444444444444,Player-4,3,22222222222222222,Player-2,2,12.824
// 44444444444444444,Player-4,3,33333333333333333,Player-3,3,0
// 44444444444444444,Player-4,3,44444444444444444,Player-4,3,0.23
export async function fetchMatchFlashbangMatrixRows(checksum: string): Promise<FlashbangMatrixRow[]> {
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
    .leftJoin('player_blinds as pb', (eb) => {
      return eb
        .onRef('p1.steam_id', '=', 'pb.flasher_steam_id')
        .onRef('p2.steam_id', '=', 'pb.flashed_steam_id')
        .on('pb.match_checksum', '=', checksum);
    })
    .where('p2.match_checksum', '=', checksum)
    .select([
      'p1.steam_id as flasherSteamId',
      (eb) => {
        return eb.fn.coalesce('p1_overrides.name', 'p1.name').as('flasherName');
      },
      't1.current_side as flasherTeamSide',
      'p2.steam_id as flashedSteamId',
      (eb) => {
        return eb.fn.coalesce('p2_overrides.name', 'p2.name').as('flashedName');
      },
      't2.current_side as flashedTeamSide',
      sql<number>`COALESCE(ROUND(AVG(pb.duration)::numeric, 2), 0)`.as('duration'),
    ])
    .orderBy('p1.team_name')
    .orderBy('flasherName')
    .orderBy('p1.steam_id')
    .orderBy('p2.team_name')
    .orderBy('flashedName')
    .orderBy('p2.steam_id')

    .groupBy([
      'p1.steam_id',
      'p1.team_name',
      'flasherName',
      't1.current_side',
      'p2.steam_id',
      'p2.team_name',
      'flashedName',
      't2.current_side',
    ])
    .execute();

  return result;
}
