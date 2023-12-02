import { DatabaseError } from 'pg';
import { db } from 'csdm/node/database/database';
import { PostgresqlErrorCode } from '../postgresql-error-code';
import { MapAlreadyExists } from './errors/map-already-exists';
import type { InsertableMap } from './map-table';

export async function insertMaps(maps: InsertableMap[]) {
  try {
    const insertedMaps = await db.insertInto('maps').values(maps).returningAll().execute();

    return insertedMaps;
  } catch (error) {
    if (error instanceof DatabaseError) {
      switch (error.code) {
        case PostgresqlErrorCode.UniqueViolation:
          throw new MapAlreadyExists();
      }
    }

    throw error;
  }
}
