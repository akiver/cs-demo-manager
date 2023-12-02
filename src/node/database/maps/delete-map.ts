import { deleteMapImageFiles } from 'csdm/node/filesystem/maps/delete-map-image-files';
import { db } from 'csdm/node/database/database';
import type { Map } from 'csdm/common/types/map';

export async function deleteMap(map: Map) {
  await db.deleteFrom('maps').where('id', '=', map.id).execute();
  await deleteMapImageFiles(map);
}
