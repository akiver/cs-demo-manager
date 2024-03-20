import { db } from 'csdm/node/database/database';
import type { Round } from 'csdm/common/types/round';
import { roundRowToRound } from './round-row-to-round';
import { fetchRoundTags } from '../tags/fetch-round-tags';

async function fetchRoundRows(checksum: string) {
  const rows = await db
    .selectFrom('rounds')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .orderBy('number')
    .execute();

  return rows;
}

export async function fetchRounds(checksum: string) {
  const [roundRows, tagRows] = await Promise.all([fetchRoundRows(checksum), fetchRoundTags(checksum)]);

  const rounds: Round[] = roundRows.map((row) => {
    const tagIds = tagRows.filter((tagRow) => tagRow.round_number === row.number).map((tagRow) => tagRow.tag_id);

    return roundRowToRound(row, tagIds);
  });

  return rounds;
}
