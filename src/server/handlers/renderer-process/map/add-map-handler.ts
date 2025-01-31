import { ensureMapImagesFoldersExist } from 'csdm/node/filesystem/maps/ensure-maps-images-folders-exist';
import type { Map } from 'csdm/common/types/map';
import { writeMapThumbnailFileFromBase64 } from 'csdm/node/filesystem/maps/write-map-thumbnail-file';
import { writeMapRadarFileFromBase64 } from 'csdm/node/filesystem/maps/write-map-radar-image-from-base64';
import { insertMaps } from 'csdm/node/database/maps/insert-maps';
import { writeMapLowerRadarFileFromBase64 } from 'csdm/node/filesystem/maps/write-map-lower-radar-file-from-base64';
import type { MapPayload } from './map-payload';
import type { InsertableMap } from 'csdm/node/database/maps/map-table';
import { mapRowToMap } from 'csdm/node/database/maps/map-row-to-map';
import { isPngBase64String } from 'csdm/node/filesystem/is-png-base64-string';
import { handleError } from '../../handle-error';

export async function addMapHandler({
  name,
  game,
  posX,
  posY,
  thresholdZ,
  scale,
  lowerRadarBase64,
  radarBase64,
  thumbnailBase64,
}: MapPayload) {
  try {
    await ensureMapImagesFoldersExist();
    const mapToInsert: InsertableMap = {
      name,
      game,
      position_x: posX,
      position_y: posY,
      threshold_z: thresholdZ,
      scale,
    };
    const insertedMaps = await insertMaps([mapToInsert]);
    if (isPngBase64String(thumbnailBase64)) {
      await writeMapThumbnailFileFromBase64(name, game, thumbnailBase64);
    }
    if (isPngBase64String(radarBase64)) {
      await writeMapRadarFileFromBase64(name, game, radarBase64);
    }
    if (isPngBase64String(lowerRadarBase64)) {
      await writeMapLowerRadarFileFromBase64(name, game, lowerRadarBase64);
    }

    const map: Map = await mapRowToMap(insertedMaps[0]);

    return map;
  } catch (error) {
    handleError(error, 'Error while adding map');
  }
}
