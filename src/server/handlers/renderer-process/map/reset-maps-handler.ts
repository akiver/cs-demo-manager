import type { Game } from 'csdm/common/types/counter-strike';
import { fetchMaps } from 'csdm/node/database/maps/fetch-maps';
import { resetDefaultMaps } from 'csdm/node/database/maps/reset-default-maps';
import { handleError } from '../../handle-error';

export async function resetMapsHandler(game: Game) {
  try {
    await resetDefaultMaps(game);
    const maps = await fetchMaps();

    return maps;
  } catch (error) {
    handleError(error, 'Error while resetting maps');
  }
}
