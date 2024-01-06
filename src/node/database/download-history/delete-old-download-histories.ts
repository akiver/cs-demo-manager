import { sql } from 'kysely';
import { db } from '../database';

export async function deleteOldDownloadHistories() {
  await db
    .deleteFrom('download_history')
    .where('downloaded_at', '<', sql<Date>`now() - interval '1 month'`)
    .execute();
}
