import { describe, it, expect } from 'vite-plus/test';
import { packInt32, packFloat32 } from 'csdm/node/database/pack-values';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import { readPositionSamplePoints } from './read-position-sample-points';

function buildPacked(ticks: number[], z?: number[]) {
  return {
    ticks: packInt32(ticks),
    x: packFloat32(ticks.map((tick) => tick * 10)),
    y: packFloat32(ticks.map((tick) => -tick)),
    z: packFloat32(z ?? ticks.map(() => 0)),
  };
}

const defaultOptions = {
  startTick: 0,
  endTick: null,
  thresholdZ: null,
  radarLevel: RadarLevel.Upper,
};

describe('readPositionSamplePoints', () => {
  it('should keep only positions inside the tick window', () => {
    const points = readPositionSamplePoints(buildPacked([10, 20, 30, 40, 50]), {
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
    const points = readPositionSamplePoints(buildPacked([10, 20, 30]), {
      ...defaultOptions,
      startTick: 30,
    });

    expect(points).toEqual([{ x: 300, y: -30 }]);
  });

  it('should filter positions by radar level', () => {
    const packed = buildPacked([10, 20, 30], [-100, 50, 200]);

    expect(
      readPositionSamplePoints(packed, { ...defaultOptions, thresholdZ: 0, radarLevel: RadarLevel.Upper }),
    ).toEqual([
      { x: 200, y: -20 },
      { x: 300, y: -30 },
    ]);
    expect(
      readPositionSamplePoints(packed, { ...defaultOptions, thresholdZ: 0, radarLevel: RadarLevel.Lower }),
    ).toEqual([{ x: 100, y: -10 }]);
  });
});
