import { db } from 'csdm/node/database/database';
import { bombDefuseStartRowToBombDefuseStart } from './bomb-defuse-start-row-to-bomb-defuse-start';

export async function fetchBombsDefuseStart(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('bombs_defuse_start')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .execute();

  const bombsDefuseStart = rows.map((row) => {
    return bombDefuseStartRowToBombDefuseStart(row);
  });

  return bombsDefuseStart;
}
