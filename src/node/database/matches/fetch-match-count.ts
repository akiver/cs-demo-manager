import { db } from 'csdm/node/database/database';

export async function fetchMatchCount(): Promise<number> {
  const { count } = db.fn;
  const result = await db.selectFrom('matches').select(count<number>('checksum').as('matchCount')).executeTakeFirst();

  return result?.matchCount ?? 0;
}
