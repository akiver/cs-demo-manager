import { fetchTeamsTable } from 'csdm/node/database/teams/fetch-teams-table';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import type { TeamsTableFilter } from 'csdm/node/database/teams/teams-table-filter';

export async function fetchTeamsTableHandler(filter: TeamsTableFilter) {
  try {
    const teams = await fetchTeamsTable(filter);

    return teams;
  } catch (error) {
    logger.error('Error while fetching teams table');
    logger.error(error);
    const errorCode = getErrorCodeFromError(error);
    throw errorCode;
  }
}
