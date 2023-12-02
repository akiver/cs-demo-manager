import { sql } from 'kysely';
import { db } from '../database';
import type { TimestampName } from './timestamp-name';

export async function updateTimestamp(timestampName: TimestampName) {
  await db
    .insertInto('timestamps')
    .values({ name: timestampName, date: sql`now()` })
    .onConflict((oc) => {
      return oc.column('name').doUpdateSet({
        date: (b) => b.ref('excluded.date'),
      });
    })
    .execute();
}
