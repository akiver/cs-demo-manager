import { fetchMatchesTable } from 'csdm/node/database/matches/fetch-matches-table';
import type { MatchTable } from 'csdm/common/types/match-table';
import type { MatchFilters } from 'csdm/node/database/match/apply-match-filters';
import { handleError } from '../../handle-error';

export type FetchMatchesTablePayload = MatchFilters;

export async function fetchMatchesTableHandler(payload: FetchMatchesTablePayload) {
  try {
    const matches: MatchTable[] = await fetchMatchesTable(payload);

    return matches;
  } catch (error) {
    handleError(error, 'Error while fetching matches table');
  }
}
