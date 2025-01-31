import { fetchTeam } from 'csdm/node/database/team/fetch-team';
import type { FetchTeamFilters } from 'csdm/node/database/team/fetch-team-filters';
import { handleError } from '../../handle-error';

export async function fetchTeamHandler(payload: FetchTeamFilters) {
  try {
    const team = await fetchTeam(payload);

    return team;
  } catch (error) {
    handleError(error, `Error while fetching team with name ${payload.name}`);
  }
}
