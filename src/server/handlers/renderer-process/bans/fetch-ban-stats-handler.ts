import { fetchBanStats } from 'csdm/node/database/bans/fetch-ban-stats';
import { handleError } from '../../handle-error';

export async function fetchBanStatsHandler() {
  try {
    const stats = await fetchBanStats();

    return stats;
  } catch (error) {
    handleError(error, 'Error while fetching ban stats');
  }
}
