import { fetchPlayersTable } from 'csdm/node/database/players/fetch-players-table';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import type { PlayersTableFilter } from 'csdm/node/database/players/players-table-filter';

export async function fetchPlayersHandler(filter: PlayersTableFilter) {
  try {
    const players = await fetchPlayersTable(filter);

    return players;
  } catch (error) {
    logger.error('Error while fetching players table');
    logger.error(error);
    const errorCode = getErrorCodeFromError(error);
    throw errorCode;
  }
}
