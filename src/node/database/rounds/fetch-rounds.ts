import { db } from 'csdm/node/database/database';
import type { Round } from 'csdm/common/types/round';
import { roundRowToRound } from './round-row-to-round';

export async function fetchRounds(checksum: string) {
  const roundsRows = await db
    .selectFrom('rounds')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .orderBy('number')
    .execute();

  const rounds: Round[] = roundsRows.map((row) => {
    return roundRowToRound(row);
  });

  return rounds;
}
