import { db } from 'csdm/node/database/database';
import type { PlayerTimeline } from 'csdm/common/types/player-timeline';
import { samplePlayerMovements } from './sample-player-movements';
import { decodePlayerPositions } from './decode-player-positions';

export async function fetchPlayersTimelines(
  checksum: string,
  roundNumber: number,
  tickrate: number,
): Promise<PlayerTimeline[]> {
  const rows = await db
    .selectFrom('player_positions as p')
    .leftJoin('steam_account_overrides', 'steam_account_overrides.steam_id', 'p.player_steam_id')
    .select([
      (eb) => {
        return eb.fn.coalesce('steam_account_overrides.name', 'p.player_name').as('player_name');
      },
      'p.player_steam_id',
      'p.ticks',
      'p.x',
      'p.y',
      'p.z',
      'p.yaw',
      'p.flash_duration_remaining',
      'p.is_ducking',
      'p.is_airborne',
      'p.state_ticks',
      'p.is_alive',
      'p.side',
      'p.money',
      'p.health',
      'p.armor',
      'p.has_helmet',
      'p.has_bomb',
      'p.has_defuse_kit',
      'p.is_scoping',
      'p.is_defusing',
      'p.is_planting',
      'p.is_grabbing_hostage',
      'p.active_weapon_name',
      'p.equipments',
      'p.grenades',
      'p.pistols',
      'p.smgs',
      'p.rifles',
      'p.heavy',
    ])
    .where('p.match_checksum', '=', checksum)
    .where('p.round_number', '=', roundNumber)
    .orderBy('p.player_steam_id')
    .orderBy('p.player_name')
    .execute();

  return rows.map((row) => {
    const { movements, states } = decodePlayerPositions(row);

    return {
      movements: samplePlayerMovements(movements, states, tickrate),
      states,
    };
  });
}
