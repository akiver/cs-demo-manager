import type { Game } from 'csdm/common/types/counter-strike';
import { fetchMaps } from 'csdm/node/database/maps/fetch-maps';
import { resetDefaultMaps } from 'csdm/node/database/maps/reset-default-maps';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';

export async function resetMapsHandler(game: Game) {
  try {
    await resetDefaultMaps(game);
    const maps = await fetchMaps();

    return maps;
  } catch (error) {
    const errorCode = getErrorCodeFromError(error);
    logger.error('Error while resetting maps');
    logger.error(error);
    throw errorCode;
  }
}
