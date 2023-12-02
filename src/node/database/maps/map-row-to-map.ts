import type { Map } from 'csdm/common/types/map';
import type { MapRow } from 'csdm/node/database/maps/map-table';
import { getMapLowerRadarFilePath } from 'csdm/node/filesystem/maps/get-map-lower-radar-file-path';
import { getMapRadarFilePath } from 'csdm/node/filesystem/maps/get-map-radar-file-path';
import { getMapThumbnailFilePath } from 'csdm/node/filesystem/maps/get-map-thumbnail-file-path';

export async function mapRowToMap(row: MapRow): Promise<Map> {
  return {
    id: String(row.id),
    name: row.name,
    game: row.game,
    posX: row.position_x,
    posY: row.position_y,
    scale: row.scale,
    radarFilePath: await getMapRadarFilePath(row.name, row.game),
    lowerRadarFilePath: await getMapLowerRadarFilePath(row.name, row.game),
    thumbnailFilePath: await getMapThumbnailFilePath(row.name, row.game),
  };
}
