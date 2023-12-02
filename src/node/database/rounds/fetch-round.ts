import type { Round } from 'csdm/common/types/round';
import { db } from 'csdm/node/database/database';
import { RoundNotFound } from './errors/round-not-found';
import { roundRowToRound } from './round-row-to-round';

export async function fetchRound(checksum: string, roundNumber: number) {
  const roundRow = await db
    .selectFrom('rounds')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('number', '=', roundNumber)
    .executeTakeFirst();
  if (roundRow === undefined) {
    throw new RoundNotFound();
  }
  const round: Round = roundRowToRound(roundRow);

  return round;
}
