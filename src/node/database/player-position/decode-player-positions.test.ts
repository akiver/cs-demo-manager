import { describe, it, expect } from 'vite-plus/test';
import { decodePlayerPositions } from './decode-player-positions';

function packInt32(values: number[]) {
  const buffer = Buffer.alloc(values.length * 4);
  values.forEach((value, index) => buffer.writeInt32BE(value, index * 4));

  return buffer;
}

function packFloat32(values: number[]) {
  const buffer = Buffer.alloc(values.length * 4);
  values.forEach((value, index) => buffer.writeFloatBE(value, index * 4));

  return buffer;
}

function packBool(values: boolean[]) {
  return Buffer.from(values.map((value) => (value ? 1 : 0)));
}

function repeat<T>(value: T, count: number) {
  return Array.from<T>({ length: count }).fill(value);
}

function buildPackedStates(count: number) {
  return {
    state_ticks: packInt32(Array.from({ length: count }, (_, index) => index)),
    is_alive: packBool(repeat(true, count)),
    side: packInt32(repeat(2, count)),
    money: packInt32(repeat(800, count)),
    health: packInt32(repeat(100, count)),
    armor: packInt32(repeat(0, count)),
    has_helmet: packBool(repeat(false, count)),
    has_bomb: packBool(repeat(false, count)),
    has_defuse_kit: packBool(repeat(false, count)),
    is_scoping: packBool(repeat(false, count)),
    is_defusing: packBool(repeat(false, count)),
    is_planting: packBool(repeat(false, count)),
    is_grabbing_hostage: packBool(repeat(false, count)),
    active_weapon_name: repeat('Glock-18', count),
    equipments: repeat('', count),
    grenades: repeat('', count),
    pistols: repeat('Glock-18', count),
    smgs: repeat('', count),
    rifles: repeat('', count),
    heavy: repeat('', count),
  };
}

function buildPackedMovements(count: number) {
  return {
    ticks: packInt32(Array.from({ length: count }, (_, index) => index)),
    x: packFloat32(repeat(0, count)),
    y: packFloat32(repeat(0, count)),
    z: packFloat32(repeat(0, count)),
    yaw: packFloat32(repeat(0, count)),
    flash_duration_remaining: packFloat32(repeat(0, count)),
    is_ducking: packBool(repeat(false, count)),
    is_airborne: packBool(repeat(false, count)),
  };
}

describe('decodePlayerPositions', () => {
  it('should decode packed movements', () => {
    const { movements } = decodePlayerPositions({
      ...buildPackedStates(1),
      player_steam_id: '76561198000000000',
      player_name: 'Player',
      ticks: packInt32([100, 101]),
      x: packFloat32([-1916, 1456.5]),
      y: packFloat32([10.25, -20]),
      z: packFloat32([-171.5, 0]),
      yaw: packFloat32([-90, 179.5]),
      flash_duration_remaining: packFloat32([0, 3.25]),
      is_ducking: packBool([true, false]),
      is_airborne: packBool([false, true]),
    });

    expect(movements).toEqual([
      {
        tick: 100,
        playerSteamId: '76561198000000000',
        playerName: 'Player',
        x: -1916,
        y: 10.25,
        z: -171.5,
        yaw: -90,
        flashDurationRemaining: 0,
        isDucking: true,
        isAirborne: false,
      },
      {
        tick: 101,
        playerSteamId: '76561198000000000',
        playerName: 'Player',
        x: 1456.5,
        y: -20,
        z: 0,
        yaw: 179.5,
        flashDurationRemaining: 3.25,
        isDucking: false,
        isAirborne: true,
      },
    ]);
  });

  it('should decode packed states', () => {
    const { states } = decodePlayerPositions({
      ...buildPackedMovements(3),
      player_steam_id: '76561198000000000',
      player_name: 'Player',
      state_ticks: packInt32([100, 150]),
      is_alive: packBool([true, false]),
      side: packInt32([2, 3]),
      money: packInt32([800, 16000]),
      health: packInt32([100, 0]),
      armor: packInt32([0, 100]),
      has_helmet: packBool([false, true]),
      has_bomb: packBool([true, false]),
      has_defuse_kit: packBool([false, true]),
      is_scoping: packBool([true, false]),
      is_defusing: packBool([false, true]),
      is_planting: packBool([true, false]),
      is_grabbing_hostage: packBool([false, true]),
      active_weapon_name: ['Glock-18', ''],
      equipments: ['', 'Kevlar Vest'],
      grenades: ['Flashbang,Smoke Grenade', ''],
      pistols: ['Glock-18', 'Desert Eagle'],
      smgs: ['', 'MP9'],
      rifles: ['', 'AK-47'],
      heavy: ['', 'Nova'],
    });

    expect(states).toEqual([
      {
        tick: 100,
        playerSteamId: '76561198000000000',
        playerName: 'Player',
        isAlive: true,
        side: 2,
        money: 800,
        health: 100,
        armor: 0,
        hasHelmet: false,
        hasBomb: true,
        hasDefuseKit: false,
        isScoping: true,
        isDefusing: false,
        isPlanting: true,
        isGrabbingHostage: false,
        activeWeaponName: 'Glock-18',
        equipments: '',
        grenades: 'Flashbang,Smoke Grenade',
        pistols: 'Glock-18',
        smgs: '',
        rifles: '',
        heavy: '',
      },
      {
        tick: 150,
        playerSteamId: '76561198000000000',
        playerName: 'Player',
        isAlive: false,
        side: 3,
        money: 16000,
        health: 0,
        armor: 100,
        hasHelmet: true,
        hasBomb: false,
        hasDefuseKit: true,
        isScoping: false,
        isDefusing: true,
        isPlanting: false,
        isGrabbingHostage: true,
        activeWeaponName: '',
        equipments: 'Kevlar Vest',
        grenades: '',
        pistols: 'Desert Eagle',
        smgs: 'MP9',
        rifles: 'AK-47',
        heavy: 'Nova',
      },
    ]);
  });

  it('should decode buffers that are not aligned on 4 bytes', () => {
    const unaligned = (buffer: Buffer) => {
      return Buffer.concat([Buffer.from([0]), buffer]).subarray(1);
    };

    const { movements, states } = decodePlayerPositions({
      ...buildPackedMovements(1),
      ...buildPackedStates(1),
      player_steam_id: '1',
      player_name: 'Player',
      ticks: unaligned(packInt32([42])),
      x: unaligned(packFloat32([1.5])),
      flash_duration_remaining: unaligned(packFloat32([5.5])),
      state_ticks: unaligned(packInt32([40])),
      money: unaligned(packInt32([1200])),
    });

    expect(movements[0].tick).toBe(42);
    expect(movements[0].x).toBe(1.5);
    expect(movements[0].flashDurationRemaining).toBe(5.5);
    expect(states[0].tick).toBe(40);
    expect(states[0].money).toBe(1200);
  });
});
