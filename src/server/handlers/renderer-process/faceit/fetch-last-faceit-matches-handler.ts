import type { FaceitMatch } from 'csdm/common/types/faceit-match';
import { fetchLastFaceitMatches } from 'csdm/node/faceit/fetch-last-faceit-matches';
import { handleError } from '../../handle-error';

export async function fetchLastFaceitMatchesHandler(accountId: string) {
  try {
    const matches: FaceitMatch[] = await fetchLastFaceitMatches(accountId);

    return matches;
  } catch (error) {
    handleError(error, 'Error while fetching last FACEIT matches');
  }
}
