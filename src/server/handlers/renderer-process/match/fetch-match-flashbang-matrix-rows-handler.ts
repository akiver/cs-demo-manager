import { handleError } from 'csdm/server/handlers/handle-error';
import { fetchMatchFlashbangMatrixRows } from 'csdm/node/database/match/fetch-match-flashbang-matrix-rows';

export async function fetchMatchFlashbangMatrixRowsHandler(checksum: string) {
  try {
    const rows = await fetchMatchFlashbangMatrixRows(checksum);

    return rows;
  } catch (error) {
    handleError(error, 'Error while fetching flashbang matrix rows');
  }
}
