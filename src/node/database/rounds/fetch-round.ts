import { db } from 'csdm/node/database/database';
import { RoundNotFound } from './errors/round-not-found';
import { roundRowToRound } from './round-row-to-round';
import { fetchRoundTags } from '../tags/fetch-round-tags';

async function fetchRoundRow(checksum: string, roundNumber: number) {
  const row = await db
    .selectFrom('rounds')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('number', '=', roundNumber)
    .executeTakeFirst();

  if (!row) {
    throw new RoundNotFound();
  }

  return row;
}

export async function fetchRound(checksum: string, roundNumber: number) {
  const [roundRow, tagRows] = await Promise.all([
    fetchRoundRow(checksum, roundNumber),
    fetchRoundTags(checksum, roundNumber),
  ]);

  const tagIds = tagRows.map((tagRow) => tagRow.tag_id);
  const round = roundRowToRound(roundRow, tagIds);

  return round;
}
