import { describe, it, expect } from 'vite-plus/test';
import type { MapBombDamageSite } from 'csdm/common/types/map-bomb-damage';
import { findBombSiteIndex } from './find-bomb-site-index';

function site(
  letter: MapBombDamageSite['letter'],
  min: [number, number, number],
  max: [number, number, number],
): MapBombDamageSite {
  return {
    letter,
    min: { x: min[0], y: min[1], z: min[2] },
    max: { x: max[0], y: max[1], z: max[2] },
    lethalReach: 2000,
  };
}

describe('findBombSiteIndex', () => {
  it('should return the site with the same letter whatever the order of the sites', () => {
    // Cache baked data lists B before A.
    const sites = [
      site('B', [-500, -1500, 1600], [100, -1000, 1700]),
      site('A', [-300, 1600, 1600], [200, 2100, 1700]),
    ];

    expect(findBombSiteIndex(sites, { site: 'A', x: 0, y: 0, z: 0 })).toBe(1);
    expect(findBombSiteIndex(sites, { site: 'b', x: 0, y: 0, z: 0 })).toBe(0);
  });

  it('should return the site containing the bomb when the bomb site is unknown', () => {
    const sites = [
      site('B', [-500, -1500, 1600], [100, -1000, 1700]),
      site('A', [-300, 1600, 1600], [200, 2100, 1700]),
    ];

    expect(findBombSiteIndex(sites, { site: '', x: -78, y: 1839, z: 1684 })).toBe(1);
    expect(findBombSiteIndex(sites, { site: '', x: -170, y: -1233, z: 1660 })).toBe(0);
  });

  it('should return the closest site when the bomb site is unknown and the bomb is outside of all sites', () => {
    const sites = [site('A', [0, 0, 0], [100, 100, 10]), site('B', [1000, 0, 0], [1100, 100, 10])];

    expect(findBombSiteIndex(sites, { site: '', x: 150, y: 50, z: 5 })).toBe(0);
    expect(findBombSiteIndex(sites, { site: '', x: 900, y: 50, z: 5 })).toBe(1);
  });

  it('should tell apart stacked sites using the Z axis when the bomb site is unknown', () => {
    // Nuke like layout, the upper site is right above the lower one.
    const sites = [site('A', [0, 0, -400], [500, 500, -300]), site('B', [0, 0, -800], [500, 500, -700])];

    expect(findBombSiteIndex(sites, { site: '', x: 250, y: 250, z: -380 })).toBe(0);
    expect(findBombSiteIndex(sites, { site: '', x: 250, y: 250, z: -760 })).toBe(1);
  });
});
