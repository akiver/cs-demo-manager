import { describe, it, expect } from 'vite-plus/test';
import { packInt32, packFloat32, packBool, unaligned } from 'csdm/node/database/pack-values';
import { repeat } from 'csdm/common/array/repeat';
import { TeamNumber } from 'csdm/common/types/counter-strike';
import { samplePlayerPositions } from './sample-player-positions';

type State = {
  tick: number;
  isAlive: boolean;
  side: TeamNumber;
};

function buildPacked({ ticks, states }: { ticks: number[]; states?: State[] }) {
  const roundStates = states ?? [{ tick: 0, isAlive: true, side: TeamNumber.T }];

  return {
    ticks: packInt32(ticks),
    x: packFloat32(ticks.map((tick) => tick * 10)),
    y: packFloat32(ticks.map((tick) => -tick)),
    z: packFloat32(repeat(0, ticks.length)),
    state_ticks: packInt32(roundStates.map((state) => state.tick)),
    is_alive: packBool(roundStates.map((state) => state.isAlive)),
    side: packInt32(roundStates.map((state) => state.side)),
  };
}

const defaultOptions = { sampleInterval: 1, startTick: 0 };

describe('samplePlayerPositions', () => {
  it('should keep one position per interval', () => {
    const samples = samplePlayerPositions(buildPacked({ ticks: [64, 65, 66, 128, 129, 200] }), {
      ...defaultOptions,
      sampleInterval: 64,
    });

    expect(samples).toEqual({
      side: TeamNumber.T,
      ticks: packInt32([64, 128, 200]),
      x: packFloat32([640, 1280, 2000]),
      y: packFloat32([-64, -128, -200]),
      z: packFloat32([0, 0, 0]),
    });
  });

  it('should ignore positions of a dead player', () => {
    const samples = samplePlayerPositions(
      buildPacked({
        ticks: [10, 20, 30, 40],
        states: [
          { tick: 0, isAlive: true, side: TeamNumber.T },
          { tick: 25, isAlive: false, side: TeamNumber.T },
        ],
      }),
      defaultOptions,
    );

    expect(samples?.ticks).toEqual(packInt32([10, 20]));
  });

  it('should not consume a sample interval with a dead position', () => {
    const samples = samplePlayerPositions(
      buildPacked({
        ticks: [64, 70, 80],
        states: [
          { tick: 0, isAlive: false, side: TeamNumber.T },
          { tick: 70, isAlive: true, side: TeamNumber.T },
        ],
      }),
      { ...defaultOptions, sampleInterval: 64 },
    );

    expect(samples?.ticks).toEqual(packInt32([70]));
  });

  it('should ignore positions before the first state', () => {
    const samples = samplePlayerPositions(
      buildPacked({
        ticks: [10, 20],
        states: [{ tick: 15, isAlive: true, side: TeamNumber.CT }],
      }),
      defaultOptions,
    );

    expect(samples?.side).toBe(TeamNumber.CT);
    expect(samples?.ticks).toEqual(packInt32([20]));
  });

  it('should ignore positions before the start tick', () => {
    const samples = samplePlayerPositions(buildPacked({ ticks: [10, 20, 30] }), { ...defaultOptions, startTick: 20 });

    expect(samples?.ticks).toEqual(packInt32([20, 30]));
  });

  it('should return null when the player was never alive', () => {
    const samples = samplePlayerPositions(
      buildPacked({
        ticks: [10, 20],
        states: [{ tick: 0, isAlive: false, side: TeamNumber.T }],
      }),
      defaultOptions,
    );

    expect(samples).toBeNull();
  });

  it('should support unaligned buffers', () => {
    const packed = buildPacked({ ticks: [10, 20] });
    const samples = samplePlayerPositions(
      {
        ...packed,
        ticks: unaligned(packed.ticks),
        x: unaligned(packed.x),
        state_ticks: unaligned(packed.state_ticks),
      },
      defaultOptions,
    );

    expect(samples?.ticks).toEqual(packInt32([10, 20]));
    expect(samples?.x).toEqual(packFloat32([100, 200]));
  });
});
