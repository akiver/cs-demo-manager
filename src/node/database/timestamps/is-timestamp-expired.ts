import { db } from 'csdm/node/database/database';
import type { TimestampName } from './timestamp-name';

export async function isTimestampExpired(
  timestampName: TimestampName,
  expirationTimeInMilliseconds?: number,
): Promise<boolean> {
  const timestamp = await db.selectFrom('timestamps').selectAll().where('name', '=', timestampName).executeTakeFirst();

  if (!timestamp) {
    return true;
  }

  const oneDayInMilliseconds = 3600 * 24 * 1000;
  const expirationTime = expirationTimeInMilliseconds ?? oneDayInMilliseconds;

  return Date.now() - timestamp.date.getTime() >= expirationTime;
}
