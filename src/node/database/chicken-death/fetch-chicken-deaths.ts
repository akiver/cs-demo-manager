import { db } from 'csdm/node/database/database';
import type { ChickenDeath } from '../../../common/types/chicken-death';
import { chickenDeathRowToChickenDeath } from './chicken-death-row-to-chicken-death';

export async function fetchChickenDeaths(checksum: string): Promise<ChickenDeath[]> {
  const rows = await db.selectFrom('chicken_deaths').selectAll().where('match_checksum', '=', checksum).execute();
  const chickenDeaths: ChickenDeath[] = rows.map((row) => {
    return chickenDeathRowToChickenDeath(row);
  });

  return chickenDeaths;
}
