import { fetchTeamsTable } from 'csdm/node/database/teams/fetch-teams-table';
import type { TeamsTableFilter } from 'csdm/node/database/teams/teams-table-filter';
import { handleError } from '../../handle-error';

export async function fetchTeamsTableHandler(filter: TeamsTableFilter) {
  try {
    const teams = await fetchTeamsTable(filter);

    return teams;
  } catch (error) {
    handleError(error, 'Error while fetching teams table');
  }
}
