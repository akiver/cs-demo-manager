import { handleError } from 'csdm/server/handlers/handle-error';
import { fetchMatchDuelsMatrixRows } from 'csdm/node/database/match/fetch-match-duels-matrix-rows';

export async function fetchMatchDuelsMatrixRowsHandler(checksum: string) {
  try {
    const rows = await fetchMatchDuelsMatrixRows(checksum);

    return rows;
  } catch (error) {
    handleError(error, 'Error while fetching duels matrix rows');
  }
}
