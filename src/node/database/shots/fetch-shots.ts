import type { WeaponName } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';
import type { Shot } from 'csdm/common/types/shot';
import { shotRowToShot } from './shot-row-to-shot';

type FetchShotsParameters = {
  checksum: string;
  roundNumber?: number;
  weaponNames?: WeaponName[];
};

export async function fetchShots({ checksum, roundNumber, weaponNames }: FetchShotsParameters): Promise<Shot[]> {
  let query = db.selectFrom('shots').selectAll().where('match_checksum', '=', checksum);

  if (roundNumber !== undefined) {
    query = query.where('round_number', '=', roundNumber);
  }

  if (Array.isArray(weaponNames) && weaponNames.length > 0) {
    query = query.where('weapon_name', 'in', weaponNames);
  }

  const rows = await query.execute();
  const shots = rows.map(shotRowToShot);

  return shots;
}
