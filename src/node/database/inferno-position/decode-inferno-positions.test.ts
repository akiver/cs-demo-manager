import { describe, it, expect } from 'vite-plus/test';
import { packInt32, unaligned } from 'csdm/node/database/pack-values';
import { decodeInfernoPositions } from './decode-inferno-positions';

describe('decodeInfernoPositions', () => {
  it('should decode the convex hulls with their tick', () => {
    const timeline = decodeInfernoPositions({
      unique_id: '129',
      thrower_steam_id: '76561198000000000',
      thrower_name: 'Player',
      x: 659.0625,
      y: -133.1875,
      z: -222,
      ticks: packInt32([4556, 4564, 5836]),
      convex_hulls_2d: ['659.057495,-133.197327', '695.025574,-192.709869,659.057495,-133.197327', ''],
    });

    expect(timeline).toEqual({
      uniqueId: '129',
      throwerSteamId: '76561198000000000',
      throwerName: 'Player',
      x: 659.0625,
      y: -133.1875,
      z: -222,
      convexHulls: [
        { tick: 4556, points: [659.057495, -133.197327] },
        { tick: 4564, points: [695.025574, -192.709869, 659.057495, -133.197327] },
        { tick: 5836, points: [] },
      ],
    });
  });

  it('should decode ticks that are not aligned on 4 bytes', () => {
    const ticks = unaligned(packInt32([42]));

    const { convexHulls } = decodeInfernoPositions({
      unique_id: '1',
      thrower_steam_id: '1',
      thrower_name: 'Player',
      x: 0,
      y: 0,
      z: 0,
      ticks,
      convex_hulls_2d: [''],
    });

    expect(convexHulls).toEqual([{ tick: 42, points: [] }]);
  });
});
