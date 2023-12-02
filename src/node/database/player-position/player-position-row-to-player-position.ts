import type { PlayerPosition } from '../../../common/types/player-position';
import type { PlayerPositionRow } from './player-position-table';

function sortWeapons(string: string | null) {
  if (string === null) {
    return '';
  }

  return string.split(',').sort().join(',');
}

export function playerPositionRowToPlayerPosition(row: PlayerPositionRow): PlayerPosition {
  return {
    id: row.id,
    matchChecksum: row.match_checksum,
    tick: row.tick,
    frame: row.frame,
    roundNumber: row.round_number,
    playerSteamId: row.player_steam_id,
    playerName: row.player_name,
    isAlive: row.is_alive,
    x: row.x,
    y: row.y,
    z: row.z,
    yaw: row.yaw,
    flashDurationRemaining: row.flash_duration_remaining,
    side: row.side,
    health: row.health,
    money: row.money,
    armor: row.armor,
    hasHelmet: row.has_helmet,
    hasBomb: row.has_bomb,
    hasDefuseKit: row.has_defuse_kit,
    isDucking: row.is_alive,
    isAirborne: row.is_airborne,
    isScoping: row.is_scoping,
    isDefusing: row.is_defusing,
    isPlanting: row.is_planting,
    isGrabbingHostage: row.is_grabbing_hostage,
    activeWeaponName: row.active_weapon_name,
    equipments: sortWeapons(row.equipments),
    grenades: sortWeapons(row.grenades),
    pistols: sortWeapons(row.pistols),
    smgs: sortWeapons(row.smgs),
    rifles: sortWeapons(row.rifles),
    heavy: sortWeapons(row.heavy),
  };
}
