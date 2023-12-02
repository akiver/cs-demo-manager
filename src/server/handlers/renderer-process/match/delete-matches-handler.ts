import { deleteMatchesByChecksums } from 'csdm/node/database/matches/delete-matches-by-checksums';
import { handleError } from '../../handle-error';

export async function deleteMatchesHandler(checksums: string[]) {
  try {
    await deleteMatchesByChecksums(checksums);
  } catch (error) {
    handleError(error, 'Error while deleting matches');
  }
}
