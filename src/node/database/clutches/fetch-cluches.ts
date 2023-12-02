import { db } from 'csdm/node/database/database';
import type { Clutch } from 'csdm/common/types/clutch';
import { clutchRowToClutch } from './clutch-row-to-clutch';

export async function fetchClutches(checksum: string) {
  const clutchRows = await db.selectFrom('clutches').selectAll().where('match_checksum', '=', checksum).execute();
  const clutches: Clutch[] = clutchRows.map((row) => {
    return clutchRowToClutch(row);
  });

  return clutches;
}
