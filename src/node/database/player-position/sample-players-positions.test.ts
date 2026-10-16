import { describe, it, expect } from 'vite-plus/test';
import type { PlayerPosition } from 'csdm/common/types/player-position';
import { samplePlayersPositions } from './sample-players-positions';

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

function buildPositions(fromTick: number, toTick: number, position: Partial<PlayerPosition> = {}) {
  const positions: PlayerPosition[] = [];
  for (let tick = fromTick; tick <= toTick; tick++) {
    positions.push(buildPosition({ ...position, tick }));
  }

  return positions;
}

function getTicks(positions: PlayerPosition[]) {
  return positions.map((position) => position.tick);
}

describe('samplePlayersPositions', () => {
  it('should keep the first position of each sample interval and the last position', () => {
    const positions = buildPositions(0, 10);

    expect(getTicks(samplePlayersPositions(positions, 64))).toEqual([0, 4, 8, 10]);
  });

  it('should keep the positions surrounding a state change', () => {
    const positions = [...buildPositions(0, 5), ...buildPositions(6, 10, { health: 50 })];

    expect(getTicks(samplePlayersPositions(positions, 64))).toEqual([0, 4, 5, 6, 8, 10]);
  });

  it('should keep the positions surrounding a flash', () => {
    const positions = [
      ...buildPositions(0, 1),
      buildPosition({ tick: 2, flashDurationRemaining: 3 }),
      buildPosition({ tick: 3, flashDurationRemaining: 2.9 }),
      buildPosition({ tick: 4, flashDurationRemaining: 2.8 }),
      buildPosition({ tick: 5, flashDurationRemaining: 2.7 }),
    ];

    expect(getTicks(samplePlayersPositions(positions, 64))).toEqual([0, 1, 2, 4, 5]);
  });

  it('should sample each player independently and preserve the order', () => {
    const positions = buildPositions(0, 5).flatMap((position) => {
      return [position, { ...position, playerSteamId: '2' }];
    });

    const sampledPositions = samplePlayersPositions(positions, 64);

    expect(sampledPositions.map((position) => `${position.tick}-${position.playerSteamId}`)).toEqual([
      '0-1',
      '0-2',
      '4-1',
      '4-2',
      '5-1',
      '5-2',
    ]);
  });

  it('should use the tickrate to compute the sample interval', () => {
    const positions = buildPositions(0, 16);

    expect(getTicks(samplePlayersPositions(positions, 128))).toEqual([0, 8, 16]);
    expect(samplePlayersPositions(positions, 16)).toBe(positions);
  });
});
