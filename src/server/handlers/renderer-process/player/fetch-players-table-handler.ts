import { fetchPlayersTable } from 'csdm/node/database/players/fetch-players-table';
import type { PlayersTableFilter } from 'csdm/node/database/players/players-table-filter';
import { handleError } from '../../handle-error';

export async function fetchPlayersHandler(filter: PlayersTableFilter) {
  try {
    const players = await fetchPlayersTable(filter);

    return players;
  } catch (error) {
    handleError(error, 'Error while fetching players table');
  }
}
