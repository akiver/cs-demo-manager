import { db } from 'csdm/node/database/database';
import { getDatabaseErrorCode } from 'csdm/node/database/get-database-error-code';
import { PostgresqlErrorCode } from '../postgresql-error-code';
import { MapAlreadyExists } from './errors/map-already-exists';
import type { InsertableMap } from './map-table';

export async function insertMaps(maps: InsertableMap[]) {
  try {
    const insertedMaps = await db.insertInto('maps').values(maps).returningAll().execute();

    return insertedMaps;
  } catch (error) {
    if (getDatabaseErrorCode(error) === PostgresqlErrorCode.UniqueViolation) {
      throw new MapAlreadyExists();
    }

    throw error;
  }
}
