import { describe, it, expect } from 'vite-plus/test';
import { packInt32, packFloat32, packBool } from 'csdm/node/database/pack-values';
import { repeat } from 'csdm/common/array/repeat';
import { TeamNumber } from 'csdm/common/types/counter-strike';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import { extractPositionPoints } from './extract-position-points';

type State = {
  tick: number;
  isAlive: boolean;
  side: TeamNumber;
};

function buildPacked({ ticks, z, states }: { ticks: number[]; z?: number[]; states?: State[] }) {
  const roundStates = states ?? [{ tick: 0, isAlive: true, side: TeamNumber.T }];

  return {
    ticks: packInt32(ticks),
    x: packFloat32(ticks.map((tick) => tick * 10)),
    y: packFloat32(ticks.map((tick) => -tick)),
    z: packFloat32(z ?? repeat(0, ticks.length)),
    state_ticks: packInt32(roundStates.map((state) => state.tick)),
    is_alive: packBool(roundStates.map((state) => state.isAlive)),
    side: packInt32(roundStates.map((state) => state.side)),
  };
}

const defaultOptions = {
  startTick: 0,
  endTick: null,
  sides: [],
  thresholdZ: null,
  radarLevel: RadarLevel.Upper,
  sampleInterval: 1,
};

describe('extractPositionPoints', () => {
  it('should keep only positions inside the tick window', () => {
    const points = extractPositionPoints(buildPacked({ ticks: [10, 20, 30, 40, 50] }), {
      ...defaultOptions,
      startTick: 20,
      endTick: 40,
    });

    expect(points).toEqual([
      { x: 200, y: -20 },
      { x: 300, y: -30 },
      { x: 400, y: -40 },
    ]);
  });

  it('should keep positions until the end when there is no upper bound', () => {
    const points = extractPositionPoints(buildPacked({ ticks: [10, 20, 30] }), {
      ...defaultOptions,
      startTick: 30,
      endTick: null,
    });

    expect(points).toEqual([{ x: 300, y: -30 }]);
  });

  it('should sample one position per interval', () => {
    const points = extractPositionPoints(buildPacked({ ticks: [64, 65, 66, 128, 129, 200] }), {
      ...defaultOptions,
      sampleInterval: 64,
    });

    expect(points).toEqual([
      { x: 640, y: -64 },
      { x: 1280, y: -128 },
      { x: 2000, y: -200 },
    ]);
  });

  it('should ignore positions of a dead player', () => {
    const points = extractPositionPoints(
      buildPacked({
        ticks: [10, 20, 30, 40],
        states: [
          { tick: 0, isAlive: true, side: TeamNumber.T },
          { tick: 25, isAlive: false, side: TeamNumber.T },
        ],
      }),
      defaultOptions,
    );

    expect(points).toEqual([
      { x: 100, y: -10 },
      { x: 200, y: -20 },
    ]);
  });

  it('should not consume a sample interval with a dead position', () => {
    const points = extractPositionPoints(
      buildPacked({
        ticks: [64, 70, 80],
        states: [
          { tick: 0, isAlive: false, side: TeamNumber.T },
          { tick: 70, isAlive: true, side: TeamNumber.T },
        ],
      }),
      { ...defaultOptions, sampleInterval: 64 },
    );

    expect(points).toEqual([{ x: 700, y: -70 }]);
  });

  it('should ignore positions before the first state', () => {
    const points = extractPositionPoints(
      buildPacked({
        ticks: [10, 20],
        states: [{ tick: 15, isAlive: true, side: TeamNumber.T }],
      }),
      defaultOptions,
    );

    expect(points).toEqual([{ x: 200, y: -20 }]);
  });

  it('should filter positions by side', () => {
    const points = extractPositionPoints(
      buildPacked({
        ticks: [10, 20, 30],
        states: [
          { tick: 0, isAlive: true, side: TeamNumber.T },
          { tick: 20, isAlive: true, side: TeamNumber.CT },
        ],
      }),
      { ...defaultOptions, sides: [TeamNumber.CT] },
    );

    expect(points).toEqual([
      { x: 200, y: -20 },
      { x: 300, y: -30 },
    ]);
  });

  it('should filter positions by radar level', () => {
    const packed = buildPacked({ ticks: [10, 20, 30], z: [-100, 50, 200] });

    expect(extractPositionPoints(packed, { ...defaultOptions, thresholdZ: 0, radarLevel: RadarLevel.Upper })).toEqual([
      { x: 200, y: -20 },
      { x: 300, y: -30 },
    ]);
    expect(extractPositionPoints(packed, { ...defaultOptions, thresholdZ: 0, radarLevel: RadarLevel.Lower })).toEqual([
      { x: 100, y: -10 },
    ]);
  });
});
