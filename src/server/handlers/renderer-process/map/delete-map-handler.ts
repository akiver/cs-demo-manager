import type { Map } from 'csdm/common/types/map';
import { deleteMap } from 'csdm/node/database/maps/delete-map';
import { handleError } from '../../handle-error';

export async function deleteMapHandler(map: Map) {
  try {
    await deleteMap(map);
  } catch (error) {
    handleError(error, 'Error while deleting map');
  }
}
