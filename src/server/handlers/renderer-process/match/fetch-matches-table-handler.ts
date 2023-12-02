import { fetchMatchesTable } from 'csdm/node/database/matches/fetch-matches-table';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import type { MatchTable } from 'csdm/common/types/match-table';
import type { MatchesTableFilter } from 'csdm/node/database/matches/matches-table-filter';

export type FetchMatchesTablePayload = MatchesTableFilter;

export async function fetchMatchesTableHandler(payload: FetchMatchesTablePayload) {
  try {
    const matches: MatchTable[] = await fetchMatchesTable(payload);

    return matches;
  } catch (error) {
    logger.error('Error while fetching matches table');
    logger.error(error);
    const errorCode = getErrorCodeFromError(error);
    throw errorCode;
  }
}
