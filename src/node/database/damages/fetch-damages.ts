import { db } from 'csdm/node/database/database';
import { damageRowToDamage } from './damage-row-to-damage';
import type { Damage } from 'csdm/common/types/damage';

export async function fetchDamages(checksum: string) {
  const rows = await db.selectFrom('damages').selectAll().where('match_checksum', '=', checksum).execute();
  const damages: Damage[] = rows.map(damageRowToDamage);

  return damages;
}
