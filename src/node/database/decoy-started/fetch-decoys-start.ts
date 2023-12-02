import { db } from 'csdm/node/database/database';
import { decoyStartRowToDecoyStart } from './decoy-start-row-to-decoy-start';

export async function fetchDecoysStart(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('decoys_start')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .execute();

  const decoysStart = rows.map(decoyStartRowToDecoyStart);

  return decoysStart;
}
