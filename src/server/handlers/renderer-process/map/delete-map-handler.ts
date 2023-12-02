import type { Map } from 'csdm/common/types/map';
import { deleteMap } from 'csdm/node/database/maps/delete-map';

export async function deleteMapHandler(map: Map) {
  try {
    await deleteMap(map);
  } catch (error) {
    logger.error('Error while deleting map');
    logger.error(error);
    throw error;
  }
}
