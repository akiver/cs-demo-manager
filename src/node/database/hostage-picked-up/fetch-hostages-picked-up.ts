import { db } from 'csdm/node/database/database';
import { hostagePickedUpRowToHostagePickedUp } from './hostage-picked-up-row-to-hostage-picked-up';

export async function fetchHostagesPickedUp(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('hostage_picked_up')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .orderBy('tick')
    .execute();

  const hostagesPickedUp = rows.map(hostagePickedUpRowToHostagePickedUp);

  return hostagesPickedUp;
}
