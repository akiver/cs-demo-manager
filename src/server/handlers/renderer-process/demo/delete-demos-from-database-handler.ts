import { deleteDemos } from 'csdm/node/database/demos/delete-demos';
import { handleError } from '../../handle-error';

export async function deleteDemosFromDatabaseHandler(checksums: string[]) {
  try {
    await deleteDemos(checksums);
  } catch (error) {
    handleError(error, 'Error while deleting demos from database');
  }
}
