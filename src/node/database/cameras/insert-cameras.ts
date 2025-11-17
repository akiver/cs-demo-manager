import { db } from 'csdm/node/database/database';
import type { InsertableCamera } from './cameras-table';
import { DatabaseError } from 'pg';
import { PostgresqlErrorCode } from '../postgresql-error-code';
import { CameraAlreadyExists } from './errors/camera-already-exists';

export async function insertCamera(camera: InsertableCamera) {
  try {
    const rows = await db.insertInto('cameras').values(camera).returningAll().execute();

    if (rows.length === 0) {
      throw new Error('Failed to insert camera');
    }

    return rows[0];
  } catch (error) {
    if (error instanceof DatabaseError) {
      switch (error.code) {
        case PostgresqlErrorCode.UniqueViolation:
          throw new CameraAlreadyExists();
      }
    }

    throw error;
  }
}
