import type { PlayersFilter } from 'csdm/common/types/search/players-filter';
import { searchPlayers } from 'csdm/node/database/search/search-players';
import { handleError } from '../../handle-error';

export async function searchPlayersHandler(filter: PlayersFilter) {
  try {
    const players = await searchPlayers(filter);

    return players;
  } catch (error) {
    handleError(error, 'Error while searching players');
  }
}
