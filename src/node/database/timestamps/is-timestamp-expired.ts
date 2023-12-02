import { db } from 'csdm/node/database/database';
import type { TimestampName } from './timestamp-name';

export async function isTimestampExpired(timestampName: TimestampName) {
  const timestamp = await db.selectFrom('timestamps').selectAll().where('name', '=', timestampName).executeTakeFirst();

  if (!timestamp) {
    return true;
  }

  const oneDayInMilliseconds = 3600 * 24 * 1000;

  return Date.now() - timestamp.date.getTime() >= oneDayInMilliseconds;
}
