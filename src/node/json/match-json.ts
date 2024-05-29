import type { GrenadeProjectileDestroy } from 'csdm/common/types/grenade-projectile-destroy';
import type { Match } from 'csdm/common/types/match';

export type MatchJson = Match & {
  grenadeDestroyed: GrenadeProjectileDestroy[];
};
