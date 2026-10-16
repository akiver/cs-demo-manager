import { describe, it, expect } from 'vite-plus/test';
import type { PlayerMovement } from 'csdm/common/types/player-movement';
import type { PlayerState } from 'csdm/common/types/player-state';
import { samplePlayerMovements } from './sample-player-movements';

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

function buildMovements(fromTick: number, toTick: number) {
  const movements: PlayerMovement[] = [];
  for (let tick = fromTick; tick <= toTick; tick++) {
    movements.push(buildMovement({ tick }));
  }

  return movements;
}

function buildState(state: Partial<PlayerState>) {
  return { tick: 0, playerSteamId: '1', ...state } as PlayerState;
}

function getTicks(movements: PlayerMovement[]) {
  return movements.map((movement) => movement.tick);
}

describe('samplePlayerMovements', () => {
  it('should keep the first movement of each sample interval and the last movement', () => {
    const movements = buildMovements(0, 10);

    expect(getTicks(samplePlayerMovements(movements, [], 64))).toEqual([0, 4, 8, 10]);
  });

  it('should keep the movements surrounding a state change', () => {
    const movements = buildMovements(0, 10);
    const states = [buildState({ tick: 0 }), buildState({ tick: 6 })];

    expect(getTicks(samplePlayerMovements(movements, states, 64))).toEqual([0, 4, 5, 6, 8, 10]);
  });

  it('should keep the movements surrounding a state change that happened between 2 movements', () => {
    const movements = [buildMovement({ tick: 0 }), buildMovement({ tick: 1 }), buildMovement({ tick: 3 })];
    const states = [buildState({ tick: 2 })];

    expect(getTicks(samplePlayerMovements(movements, states, 64))).toEqual([0, 1, 3]);
  });

  it('should keep the movements surrounding a flash', () => {
    const movements = [
      ...buildMovements(0, 1),
      buildMovement({ tick: 2, flashDurationRemaining: 3 }),
      buildMovement({ tick: 3, flashDurationRemaining: 2.9 }),
      buildMovement({ tick: 4, flashDurationRemaining: 2.8 }),
      buildMovement({ tick: 5, flashDurationRemaining: 2.7 }),
    ];

    expect(getTicks(samplePlayerMovements(movements, [], 64))).toEqual([0, 1, 2, 4, 5]);
  });

  it('should return no movements when there are none', () => {
    expect(samplePlayerMovements([], [], 64)).toEqual([]);
  });

  it('should use the tickrate to compute the sample interval', () => {
    const movements = buildMovements(0, 16);

    expect(getTicks(samplePlayerMovements(movements, [], 128))).toEqual([0, 8, 16]);
    expect(samplePlayerMovements(movements, [], 16)).toBe(movements);
  });
});
