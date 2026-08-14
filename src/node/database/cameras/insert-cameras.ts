import { db } from 'csdm/node/database/database';
import type { InsertableCamera } from './cameras-table';
import { getDatabaseErrorCode } from 'csdm/node/database/get-database-error-code';
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
    if (getDatabaseErrorCode(error) === PostgresqlErrorCode.UniqueViolation) {
      throw new CameraAlreadyExists();
    }

    throw error;
  }
}
