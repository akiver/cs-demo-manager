import { sql } from 'kysely';
import { db } from '../database';

export async function insertDownloadHistory(matchId: string) {
  await db
    .insertInto('download_history')
    .values({ match_id: matchId })
    .onConflict((oc) => {
      return oc.column('match_id').doUpdateSet({
        downloaded_at: () => sql`now()`,
      });
    })
    .execute();
}
