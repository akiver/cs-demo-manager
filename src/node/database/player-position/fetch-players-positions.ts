import { db } from 'csdm/node/database/database';
import type { PlayerPosition } from '../../../common/types/player-position';
import { playerPositionRowToPlayerPosition } from './player-position-row-to-player-position';
import { fillMissingTicks } from 'csdm/common/array/fill-missing-ticks';

export async function fetchPlayersPositions(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('player_positions as p')
    .leftJoin('steam_account_overrides', 'steam_account_overrides.steam_id', 'p.player_steam_id')
    .distinctOn(['p.tick', 'p.player_steam_id'])
    .select([
      (eb) => {
        return eb.fn.coalesce('steam_account_overrides.name', 'p.player_name').as('player_name');
      },
      'p.active_weapon_name',
      'p.armor',
      'p.equipments',
      'p.flash_duration_remaining',
      'p.frame',
      'p.grenades',
      'p.has_bomb',
      'p.has_defuse_kit',
      'p.has_helmet',
      'p.health',
      'p.heavy',
      'p.id',
      'p.is_airborne',
      'p.is_alive',
      'p.is_defusing',
      'p.is_ducking',
      'p.is_grabbing_hostage',
      'p.is_planting',
      'p.is_scoping',
      'p.match_checksum',
      'p.money',
      'p.pistols',
      'p.player_steam_id',
      'p.rifles',
      'p.round_number',
      'p.side',
      'p.smgs',
      'p.tick',
      'p.x',
      'p.y',
      'p.yaw',
      'p.z',
    ])
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .orderBy('p.tick')
    .orderBy('p.player_steam_id')
    .execute();

  const playerPositions: PlayerPosition[] = fillMissingTicks(rows.map(playerPositionRowToPlayerPosition));

  return playerPositions;
}
