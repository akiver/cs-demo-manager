import { destroyDatabaseConnection } from 'csdm/node/database/database';
import { throwErrorMessage } from 'csdm/server/handlers/throw-error-message';
import { deleteEmbeddedDatabaseData } from 'csdm/node/database/embedded/embedded-postgresql';

export async function deleteEmbeddedDatabaseDataHandler() {
  try {
    // Release the app pools first so they don't point at the deleted data folder if a connection is active.
    await destroyDatabaseConnection();
    await deleteEmbeddedDatabaseData();
  } catch (error) {
    throwErrorMessage(error, 'Error while deleting the embedded database data');
  }
}
