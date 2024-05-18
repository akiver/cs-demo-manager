import { ErrorCode } from 'csdm/common/error-code';
import { fetchTeam } from 'csdm/node/database/team/fetch-team';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import type { FetchTeamFilters } from 'csdm/node/database/team/fetch-team-filters';

export async function fetchTeamHandler(payload: FetchTeamFilters) {
  try {
    const team = await fetchTeam(payload);

    return team;
  } catch (error) {
    const errorCode = getErrorCodeFromError(error);
    if (errorCode === ErrorCode.UnknownError) {
      logger.error(`Error while fetching team with name ${payload.name}`);
      logger.error(error);
    }
    throw errorCode;
  }
}
