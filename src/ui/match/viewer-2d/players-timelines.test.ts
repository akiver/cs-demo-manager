import { describe, it, expect } from 'vite-plus/test';
import type { PlayerMovement } from 'csdm/common/types/player-movement';
import type { PlayerState } from 'csdm/common/types/player-state';
import type { PlayerTimeline } from 'csdm/common/types/player-timeline';
import {
  findBombCarrierPositions,
  findLastPositionAtOrBeforeTick,
  getPlayersPositionsAtTick,
} from './players-timelines';

function buildMovement(movement: Partial<PlayerMovement>): PlayerMovement {
  return {
    tick: 0,
    playerSteamId: '1',
    playerName: 'Player 1',
    x: 0,
    y: 0,
    z: 0,
    yaw: 0,
    flashDurationRemaining: 0,
    isDucking: false,
    isAirborne: false,
    ...movement,
  };
}

function buildState(state: Partial<PlayerState>): PlayerState {
  return {
    tick: 0,
    playerSteamId: '1',
    playerName: 'Player 1',
    isAlive: true,
    side: 2,
    money: 800,
    health: 100,
    armor: 0,
    hasHelmet: false,
    hasBomb: false,
    hasDefuseKit: false,
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
    ...state,
  } as PlayerState;
}

// Builds the timeline of each player like the server does, players are identified by their SteamID.
function buildPlayersTimelines(movements: PlayerMovement[], states: PlayerState[]): PlayerTimeline[] {
  const steamIds = [...new Set(movements.map((movement) => movement.playerSteamId))];

  return steamIds.map((steamId) => {
    return {
      movements: movements.filter((movement) => movement.playerSteamId === steamId),
      states: states.filter((state) => state.playerSteamId === steamId),
    };
  });
}

const maxInterpolationTickCount = 64;

describe('getPlayersPositionsAtTick', () => {
  it('should merge the movement and the state of the tick', () => {
    const timelines = buildPlayersTimelines(
      [buildMovement({ tick: 0 }), buildMovement({ tick: 4, x: 100 }), buildMovement({ tick: 8 })],
      [buildState({ tick: 0 })],
    );

    const [position] = getPlayersPositionsAtTick(timelines, 4, maxInterpolationTickCount);

    expect(position.tick).toBe(4);
    expect(position.x).toBe(100);
    expect(position.playerName).toBe('Player 1');
  });

  it('should interpolate movements', () => {
    const timelines = buildPlayersTimelines(
      [
        buildMovement({ tick: 0, x: 0, y: 100, z: 10, flashDurationRemaining: 2 }),
        buildMovement({ tick: 4, x: 40, y: 60, z: 30, flashDurationRemaining: 1 }),
      ],
      [buildState({ tick: 0 })],
    );

    const [position] = getPlayersPositionsAtTick(timelines, 1, maxInterpolationTickCount);

    expect(position.tick).toBe(1);
    expect(position.x).toBe(10);
    expect(position.y).toBe(90);
    expect(position.z).toBe(15);
    expect(position.flashDurationRemaining).toBe(1.75);
  });

  it('should use the last state at or before the tick', () => {
    const timelines = buildPlayersTimelines(
      [buildMovement({ tick: 0 }), buildMovement({ tick: 8 })],
      [buildState({ tick: 0, health: 100 }), buildState({ tick: 3, health: 50 })],
    );

    expect(getPlayersPositionsAtTick(timelines, 2, maxInterpolationTickCount)[0].health).toBe(100);
    expect(getPlayersPositionsAtTick(timelines, 3, maxInterpolationTickCount)[0].health).toBe(50);
    expect(getPlayersPositionsAtTick(timelines, 5, maxInterpolationTickCount)[0].health).toBe(50);
  });

  it('should interpolate the yaw using the shortest rotation', () => {
    const timelines = buildPlayersTimelines(
      [buildMovement({ tick: 0, yaw: 170 }), buildMovement({ tick: 4, yaw: -170 })],
      [buildState({ tick: 0 })],
    );

    const [position] = getPlayersPositionsAtTick(timelines, 2, maxInterpolationTickCount);

    expect(position.yaw).toBe(180);
  });

  it('should not interpolate when movements are too far apart', () => {
    const timelines = buildPlayersTimelines(
      [buildMovement({ tick: 0, x: 0 }), buildMovement({ tick: 100, x: 100 })],
      [buildState({ tick: 0 })],
    );

    const [position] = getPlayersPositionsAtTick(timelines, 50, maxInterpolationTickCount);

    expect(position.x).toBe(0);
    expect(position.tick).toBe(50);
  });

  it('should not return players outside of their movements range or without state', () => {
    const timelines = buildPlayersTimelines(
      [
        buildMovement({ tick: 10, playerSteamId: '1' }),
        buildMovement({ tick: 20, playerSteamId: '1' }),
        buildMovement({ tick: 0, playerSteamId: '2' }),
        buildMovement({ tick: 30, playerSteamId: '2' }),
      ],
      [buildState({ tick: 10, playerSteamId: '1' }), buildState({ tick: 5, playerSteamId: '2' })],
    );

    const getSteamIds = (tick: number) => {
      return getPlayersPositionsAtTick(timelines, tick, maxInterpolationTickCount).map((p) => p.playerSteamId);
    };

    expect(getSteamIds(2)).toEqual([]);
    expect(getSteamIds(5)).toEqual(['2']);
    expect(getSteamIds(15)).toEqual(['1', '2']);
    expect(getSteamIds(25)).toEqual(['2']);
  });
});

describe('findBombCarrierPositions', () => {
  it('should return the positions of the players carrying the bomb sorted by tick', () => {
    const timelines = buildPlayersTimelines(
      [
        buildMovement({ tick: 0, x: 0 }),
        buildMovement({ tick: 10, x: 100 }),
        buildMovement({ tick: 11, x: 110 }),
        buildMovement({ tick: 0, x: 0, playerSteamId: '2' }),
        buildMovement({ tick: 14, x: 140, playerSteamId: '2' }),
        buildMovement({ tick: 15, x: 150, playerSteamId: '2' }),
        buildMovement({ tick: 19, x: 190, playerSteamId: '2' }),
        buildMovement({ tick: 20, x: 200, playerSteamId: '2' }),
      ].sort((movementA, movementB) => movementA.tick - movementB.tick),
      [
        buildState({ tick: 0, hasBomb: true }),
        buildState({ tick: 0, playerSteamId: '2' }),
        buildState({ tick: 11, hasBomb: false }),
        buildState({ tick: 15, hasBomb: true, playerSteamId: '2' }),
        buildState({ tick: 20, hasBomb: false, isAlive: false, playerSteamId: '2' }),
      ],
    );

    const positions = findBombCarrierPositions(timelines);

    expect(positions.map((position) => [position.playerSteamId, position.tick, position.x])).toEqual([
      ['1', 0, 0],
      ['1', 10, 100],
      ['2', 15, 150],
      ['2', 19, 190],
    ]);
  });

  it('should include the last position of a carrier whose data ends with the bomb', () => {
    const timelines = buildPlayersTimelines(
      [buildMovement({ tick: 0, x: 0 }), buildMovement({ tick: 10, x: 100 })],
      [buildState({ tick: 0, hasBomb: true })],
    );

    const positions = findBombCarrierPositions(timelines);

    expect(findLastPositionAtOrBeforeTick(positions, 50)?.x).toBe(100);
  });
});

describe('findLastPositionAtOrBeforeTick', () => {
  const timelines = buildPlayersTimelines(
    [buildMovement({ tick: 0 }), buildMovement({ tick: 30 })],
    [buildState({ tick: 0 })],
  );
  const positions = [10, 20, 30].map(
    (tick) => getPlayersPositionsAtTick(timelines, tick, maxInterpolationTickCount)[0],
  );

  it('should return the last position at or before the tick', () => {
    expect(findLastPositionAtOrBeforeTick(positions, 20)?.tick).toBe(20);
    expect(findLastPositionAtOrBeforeTick(positions, 25)?.tick).toBe(20);
    expect(findLastPositionAtOrBeforeTick(positions, 100)?.tick).toBe(30);
  });

  it('should return undefined when there is no position before the tick', () => {
    expect(findLastPositionAtOrBeforeTick(positions, 9)).toBeUndefined();
  });
});
