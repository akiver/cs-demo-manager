import type { Map } from 'csdm/common/types/map';
import type { MapRow } from 'csdm/node/database/maps/map-table';
import { getPngInformation } from 'csdm/node/filesystem/get-png-information';
import { getMapLowerRadarFilePath } from 'csdm/node/filesystem/maps/get-map-lower-radar-file-path';
import { getMapRadarFilePath } from 'csdm/node/filesystem/maps/get-map-radar-file-path';
import { getMapThumbnailFilePath } from 'csdm/node/filesystem/maps/get-map-thumbnail-file-path';

export async function mapRowToMap(row: MapRow): Promise<Map> {
  const radarFilePath = await getMapRadarFilePath(row.name, row.game);
  let radarSize = 1024;
  if (radarFilePath) {
    const { width } = await getPngInformation(radarFilePath);
    radarSize = width;
  }

  return {
    id: String(row.id),
    name: row.name,
    game: row.game,
    posX: row.position_x,
    posY: row.position_y,
    thresholdZ: row.threshold_z,
    scale: row.scale,
    radarSize,
    radarFilePath,
    lowerRadarFilePath: await getMapLowerRadarFilePath(row.name, row.game),
    thumbnailFilePath: await getMapThumbnailFilePath(row.name, row.game),
  };
}
