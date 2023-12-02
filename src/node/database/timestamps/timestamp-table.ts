import type { Generated } from 'kysely';
import type { TimestampName } from './timestamp-name';

export type TimestampTable = {
  name: TimestampName;
  date: Generated<Date>;
};
