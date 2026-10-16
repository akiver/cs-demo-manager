import type { TeamNumber, WeaponName } from 'csdm/common/types/counter-strike';
import type { PlayerMovement } from 'csdm/common/types/player-movement';
import type { PlayerState } from 'csdm/common/types/player-state';
import type { PlayerTimeline } from 'csdm/common/types/player-timeline';
import type { PlayerPositionTable } from './player-position-table';

type PackedPlayerPositions = Omit<PlayerPositionTable, 'match_checksum' | 'round_number'>;

function createDataView(buffer: Buffer) {
  // Buffers may not be aligned on 4 bytes, a DataView doesn't require it unlike typed arrays.
  return new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}

function decodeMovements(packed: PackedPlayerPositions): PlayerMovement[] {
  const ticks = createDataView(packed.ticks);
  const x = createDataView(packed.x);
  const y = createDataView(packed.y);
  const z = createDataView(packed.z);
  const yaw = createDataView(packed.yaw);
  const flashDurationRemaining = createDataView(packed.flash_duration_remaining);
  const count = packed.ticks.byteLength / 4;
  const movements: PlayerMovement[] = [];
  for (let index = 0; index < count; index++) {
    const offset = index * 4;
    movements.push({
      tick: ticks.getInt32(offset),
      playerSteamId: packed.player_steam_id,
      playerName: packed.player_name,
      x: x.getFloat32(offset),
      y: y.getFloat32(offset),
      z: z.getFloat32(offset),
      yaw: yaw.getFloat32(offset),
      flashDurationRemaining: flashDurationRemaining.getFloat32(offset),
      isDucking: packed.is_ducking[index] === 1,
      isAirborne: packed.is_airborne[index] === 1,
    });
  }

  return movements;
}

function decodeStates(packed: PackedPlayerPositions): PlayerState[] {
  const ticks = createDataView(packed.state_ticks);
  const side = createDataView(packed.side);
  const money = createDataView(packed.money);
  const health = createDataView(packed.health);
  const armor = createDataView(packed.armor);
  const count = packed.state_ticks.byteLength / 4;
  const states: PlayerState[] = [];
  for (let index = 0; index < count; index++) {
    const offset = index * 4;
    states.push({
      tick: ticks.getInt32(offset),
      playerSteamId: packed.player_steam_id,
      playerName: packed.player_name,
      isAlive: packed.is_alive[index] === 1,
      side: side.getInt32(offset) as TeamNumber,
      money: money.getInt32(offset),
      health: health.getInt32(offset),
      armor: armor.getInt32(offset),
      hasHelmet: packed.has_helmet[index] === 1,
      hasBomb: packed.has_bomb[index] === 1,
      hasDefuseKit: packed.has_defuse_kit[index] === 1,
      isScoping: packed.is_scoping[index] === 1,
      isDefusing: packed.is_defusing[index] === 1,
      isPlanting: packed.is_planting[index] === 1,
      isGrabbingHostage: packed.is_grabbing_hostage[index] === 1,
      activeWeaponName: packed.active_weapon_name[index] as WeaponName,
      // Weapons are sorted by the analyzer
      equipments: packed.equipments[index],
      grenades: packed.grenades[index],
      pistols: packed.pistols[index],
      smgs: packed.smgs[index],
      rifles: packed.rifles[index],
      heavy: packed.heavy[index],
    });
  }

  return states;
}

export function decodePlayerPositions(packed: PackedPlayerPositions): PlayerTimeline {
  return {
    movements: decodeMovements(packed),
    states: decodeStates(packed),
  };
}
