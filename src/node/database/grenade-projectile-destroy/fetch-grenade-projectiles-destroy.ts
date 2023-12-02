import { db } from 'csdm/node/database/database';
import { grenadeProjectileDestroyRowToGrenadeProjectileDestroy } from './grenade-projectile-destroy-row-to-grenade-projectile-destroy';

export async function fetchGrenadeProjectileDestroy(checksum: string) {
  const rows = await db
    .selectFrom('grenade_projectiles_destroy')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .execute();
  const grenadeProjectilesDestroy = rows.map(grenadeProjectileDestroyRowToGrenadeProjectileDestroy);

  return grenadeProjectilesDestroy;
}
