import { fetchLastRenownMatches } from 'csdm/node/renown/fetch-last-renown-matches';
import { handleError } from '../../handle-error';

export async function fetchLastRenownMatchesHandler(steamId: string) {
  try {
    const matches = await fetchLastRenownMatches(steamId);

    return matches;
  } catch (error) {
    handleError(error, 'Error while fetching last Renown matches');
  }
}
