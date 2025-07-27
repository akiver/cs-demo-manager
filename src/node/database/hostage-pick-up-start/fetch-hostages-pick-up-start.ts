import { db } from 'csdm/node/database/database';
import { hostagePickUpStartRowToHostagePickUpStart } from './hostage-pick-up-start-row-to-hostage-pick-up-start';

export async function fetchHostagesPickUpStart(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('hostage_pick_up_start')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .orderBy('tick')
    .execute();

  const hostagesPickUpStart = rows.map(hostagePickUpStartRowToHostagePickUpStart);

  return hostagesPickUpStart;
}
