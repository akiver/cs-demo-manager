import { describe, it, expect } from 'vite-plus/test';
import type { PlayerPosition } from 'csdm/common/types/player-position';
import { buildPlayersTimelines, findLastPositionBeforeTick, getPlayersPositionsAtTick } from './players-timelines';

function buildPosition(position: Partial<PlayerPosition>): PlayerPosition {
  return {
    id: '1',
    matchChecksum: 'checksum',
    roundNumber: 1,
    tick: 0,
    frame: 0,
    isAlive: true,
    x: 0,
    y: 0,
    z: 0,
    yaw: 0,
    flashDurationRemaining: 0,
    side: 2,
    money: 800,
    health: 100,
    armor: 0,
    hasHelmet: false,
    hasBomb: false,
    hasDefuseKit: false,
    isDucking: false,
    isAirborne: false,
    isScoping: false,
    isDefusing: false,
    isPlanting: false,
    isGrabbingHostage: false,
    activeWeaponName: 'Glock-18',
    equipments: '',
    grenades: '',
    pistols: '',
    smgs: '',
    rifles: '',
    heavy: '',
    playerSteamId: '1',
    playerName: 'Player 1',
    ...position,
  } as PlayerPosition;
}

describe('getPlayersPositionsAtTick', () => {
  const maxInterpolationTickCount = 64;

  it('should return the sample when the tick matches exactly', () => {
    const sample = buildPosition({ tick: 4, x: 100 });
    const timelines = buildPlayersTimelines([buildPosition({ tick: 0 }), sample, buildPosition({ tick: 8 })]);

    expect(getPlayersPositionsAtTick(timelines, 4, maxInterpolationTickCount)).toEqual([sample]);
  });

  it('should interpolate continuous values and keep discrete values from the previous sample', () => {
    const timelines = buildPlayersTimelines([
      buildPosition({ tick: 0, x: 0, y: 100, z: 10, flashDurationRemaining: 2, health: 100 }),
      buildPosition({ tick: 4, x: 40, y: 60, z: 30, flashDurationRemaining: 1, health: 50 }),
    ]);

    const [position] = getPlayersPositionsAtTick(timelines, 1, maxInterpolationTickCount);

    expect(position.tick).toBe(1);
    expect(position.x).toBe(10);
    expect(position.y).toBe(90);
    expect(position.z).toBe(15);
    expect(position.flashDurationRemaining).toBe(1.75);
    expect(position.health).toBe(100);
  });

  it('should interpolate the yaw using the shortest rotation', () => {
    const timelines = buildPlayersTimelines([
      buildPosition({ tick: 0, yaw: 170 }),
      buildPosition({ tick: 4, yaw: -170 }),
    ]);

    const [position] = getPlayersPositionsAtTick(timelines, 2, maxInterpolationTickCount);

    expect(position.yaw).toBe(180);
  });

  it('should not interpolate when samples are too far apart', () => {
    const timelines = buildPlayersTimelines([buildPosition({ tick: 0, x: 0 }), buildPosition({ tick: 100, x: 100 })]);

    const [position] = getPlayersPositionsAtTick(timelines, 50, maxInterpolationTickCount);

    expect(position.x).toBe(0);
    expect(position.tick).toBe(50);
  });

  it('should not return players outside of their positions range', () => {
    const timelines = buildPlayersTimelines([
      buildPosition({ tick: 10, playerSteamId: '1' }),
      buildPosition({ tick: 20, playerSteamId: '1' }),
      buildPosition({ tick: 0, playerSteamId: '2' }),
      buildPosition({ tick: 30, playerSteamId: '2' }),
    ]);

    expect(getPlayersPositionsAtTick(timelines, 5, maxInterpolationTickCount).map((p) => p.playerSteamId)).toEqual([
      '2',
    ]);
    expect(getPlayersPositionsAtTick(timelines, 15, maxInterpolationTickCount).map((p) => p.playerSteamId)).toEqual([
      '1',
      '2',
    ]);
    expect(getPlayersPositionsAtTick(timelines, 25, maxInterpolationTickCount).map((p) => p.playerSteamId)).toEqual([
      '2',
    ]);
  });
});

describe('findLastPositionBeforeTick', () => {
  const positions = [buildPosition({ tick: 10 }), buildPosition({ tick: 20 }), buildPosition({ tick: 30 })];

  it('should return the last position strictly before the tick', () => {
    expect(findLastPositionBeforeTick(positions, 20)?.tick).toBe(10);
    expect(findLastPositionBeforeTick(positions, 25)?.tick).toBe(20);
    expect(findLastPositionBeforeTick(positions, 100)?.tick).toBe(30);
  });

  it('should return undefined when there is no position before the tick', () => {
    expect(findLastPositionBeforeTick(positions, 10)).toBeUndefined();
  });
});
