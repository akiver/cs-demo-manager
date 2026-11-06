import { describe, it, expect } from 'vite-plus/test';
import { getLegacyLethalDistance } from './legacy-bomb-damage';

describe('getLegacyLethalDistance', () => {
  it('should match the known CS:GO lethal distances at 100 HP', () => {
    expect(Math.round(getLegacyLethalDistance(100, false))).toBe(1047);
    expect(Math.round(getLegacyLethalDistance(100, true))).toBe(790);
  });

  it('should decrease when the health increases', () => {
    expect(getLegacyLethalDistance(50, false)).toBeGreaterThan(getLegacyLethalDistance(100, false));
    expect(getLegacyLethalDistance(500, false)).toBe(0);
  });

  it('should be 0 when the blast cannot kill the player', () => {
    expect(getLegacyLethalDistance(300, true)).toBe(0);
  });
});
