// Radial C4 damage model used by CS:GO and by CS2 until the July 2026 update that replaced it by a shockwave
// simulation baked into each map. CS2 still uses it on maps without baked data (community maps not recompiled since).
//
// The planted C4 deals the map bomb radius as damage (500 by default) within a radius of 3.5 times this value, ignoring
// walls.
// The damage follows a Gaussian falloff where the radius is 3 standard deviations, and kevlar halves the blast damage.
const LEGACY_BOMB_DAMAGE = 500;
export const LEGACY_BOMB_RADIUS = LEGACY_BOMB_DAMAGE * 3.5;
const SIGMA = LEGACY_BOMB_RADIUS / 3;
const ARMOR_DAMAGE_RATIO = 0.5;

/**
 * Distance from the bomb up to which the blast kills a player with the given health.
 */
export function getLegacyLethalDistance(health: number, hasArmor: boolean): number {
  const maxDamage = hasArmor ? LEGACY_BOMB_DAMAGE * ARMOR_DAMAGE_RATIO : LEGACY_BOMB_DAMAGE;
  if (health > maxDamage) {
    return 0;
  }

  return SIGMA * Math.sqrt(2 * Math.log(maxDamage / health));
}
