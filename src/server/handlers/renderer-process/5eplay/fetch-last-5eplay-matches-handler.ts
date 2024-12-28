import { handleError } from '../../handle-error';
import type { FiveEPlayMatch } from 'csdm/common/types/5eplay-match';
import { fetchLast5EPlayMatches } from 'csdm/node/5eplay/fetch-last-5eplay-matches';

export async function fetchLast5EPlayMatchesHandler(accountId: string): Promise<FiveEPlayMatch[]> {
  try {
    const matches = await fetchLast5EPlayMatches(accountId);

    return matches;
  } catch (error) {
    handleError(error, 'Error while fetching last 5Eplay matches');
  }
}
