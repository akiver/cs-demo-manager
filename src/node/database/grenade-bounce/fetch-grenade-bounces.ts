import { db } from 'csdm/node/database/database';
import { grenadeBounceRowToGrenadeBounce } from './grenade-bounce-row-to-grenade-bounce';

export async function fetchGrenadeBounces(checksum: string) {
  const rows = await db.selectFrom('grenade_bounces').selectAll().where('match_checksum', '=', checksum).execute();
  const grenadeBounces = rows.map(grenadeBounceRowToGrenadeBounce);

  return grenadeBounces;
}
