import { db } from 'csdm/node/database/database';

export async function fetchRoundsComment(checksum: string) {
  const query = db
    .selectFrom('round_comments')
    .select(['match_checksum', 'number', 'comment'])
    .where('match_checksum', '=', checksum)
    .orderBy('number');

  const rows = await query.execute();

  return rows;
}
