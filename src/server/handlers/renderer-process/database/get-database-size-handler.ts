import { getDatabaseSize } from 'csdm/node/database/get-database-size';
import { handleError } from '../../handle-error';

export async function getDatabaseSizeHandler() {
  try {
    const databaseSize = await getDatabaseSize();

    return databaseSize;
  } catch (error) {
    handleError(error, 'Error while getting database size');
  }
}
