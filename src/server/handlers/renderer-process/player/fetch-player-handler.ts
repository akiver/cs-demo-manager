import { fetchPlayer } from 'csdm/node/database/player/fetch-player';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import type { FetchPlayerFilters } from 'csdm/node/database/player/fetch-player-filters';
import { ErrorCode } from 'csdm/common/error-code';

export async function fetchPlayerHandler(payload: FetchPlayerFilters) {
  try {
    const player = await fetchPlayer(payload);

    return player;
  } catch (error) {
    const errorCode = getErrorCodeFromError(error);
    if (errorCode === ErrorCode.UnknownError) {
      logger.error(`Error while fetching player with steamID ${payload.steamId}`);
      logger.error(error);
    }
    throw errorCode;
  }
}
