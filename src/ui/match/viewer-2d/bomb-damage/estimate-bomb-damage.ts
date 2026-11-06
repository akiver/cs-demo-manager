// The baked map data only stores the shockwave travel distance, the game converts it into HP at runtime.
// The blast kills up to the lethal reach of the site, then the damage decreases linearly by 100 HP over 1800 units
// whatever the site, and is truncated to an integer.
// Verified against the C4 hits recorded in demos.
export const BOMB_DAMAGE_FALLOFF_DISTANCE = 1800;

export function estimateBombDamage(distance: number, lethalReach: number): number {
  if (distance <= lethalReach) {
    return 100;
  }

  const damage = 100 - (100 * (distance - lethalReach)) / BOMB_DAMAGE_FALLOFF_DISTANCE;

  return Math.max(0, Math.floor(damage));
}
