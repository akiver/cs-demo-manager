import type { MapNamesFilter } from 'csdm/common/types/search/map-names-filter';
import { searchMapNames } from 'csdm/node/database/search/search-map-names';
import { handleError } from '../../handle-error';

export async function searchMapNamesHandler(filter: MapNamesFilter) {
  try {
    const mapNames = await searchMapNames(filter);

    return mapNames;
  } catch (error) {
    handleError(error, 'Error while searching map names');
  }
}
