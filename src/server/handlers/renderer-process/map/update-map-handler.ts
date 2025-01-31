import { ensureMapImagesFoldersExist } from 'csdm/node/filesystem/maps/ensure-maps-images-folders-exist';
import { writeMapThumbnailFileFromBase64 } from 'csdm/node/filesystem/maps/write-map-thumbnail-file';
import { writeMapRadarFileFromBase64 } from 'csdm/node/filesystem/maps/write-map-radar-image-from-base64';
import { getMapThumbnailBase64 } from 'csdm/node/filesystem/maps/get-map-thumbnail-base64';
import { getMapRadarBase64 } from 'csdm/node/filesystem/maps/get-map-radar-base64';
import { updateMap } from 'csdm/node/database/maps/update-map';
import { getMapLowerRadarBase64 } from 'csdm/node/filesystem/maps/get-map-lower-radar-base64';
import { writeMapLowerRadarFileFromBase64 } from 'csdm/node/filesystem/maps/write-map-lower-radar-file-from-base64';
import type { MapPayload } from './map-payload';
import type { UpdatableMap } from 'csdm/node/database/maps/map-table';
import { mapRowToMap } from 'csdm/node/database/maps/map-row-to-map';
import { isPngBase64String } from 'csdm/node/filesystem/is-png-base64-string';
import { handleError } from '../../handle-error';

export async function updateMapHandler({
  id,
  name,
  game,
  posX,
  posY,
  thresholdZ,
  lowerRadarBase64,
  radarBase64,
  scale,
  thumbnailBase64,
}: MapPayload) {
  try {
    await ensureMapImagesFoldersExist();

    const mapToUpdate: UpdatableMap = {
      id,
      name,
      game,
      position_x: posX,
      position_y: posY,
      threshold_z: thresholdZ,
      scale,
    };
    const updatedMaps = await updateMap(mapToUpdate);

    const currentThumbnailBase64 = await getMapThumbnailBase64(name, game);
    if (isPngBase64String(thumbnailBase64) && thumbnailBase64 !== currentThumbnailBase64) {
      await writeMapThumbnailFileFromBase64(name, game, thumbnailBase64);
    }

    const currentRadarBase64 = await getMapRadarBase64(name, game);
    if (isPngBase64String(radarBase64) && radarBase64 !== currentRadarBase64) {
      await writeMapRadarFileFromBase64(name, game, radarBase64);
    }

    const currentLowerRadarBase64 = await getMapLowerRadarBase64(name, game);
    if (isPngBase64String(lowerRadarBase64) && radarBase64 !== currentLowerRadarBase64) {
      await writeMapLowerRadarFileFromBase64(name, game, lowerRadarBase64);
    }

    const updatedMap = await mapRowToMap(updatedMaps[0]);

    return updatedMap;
  } catch (error) {
    handleError(error, 'Error while updating map');
  }
}
