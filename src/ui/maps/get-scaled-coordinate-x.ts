import { MAP_RADAR_SIZE } from 'csdm/ui/maps/maps-constants';
import type { Map } from 'csdm/common/types/map';

export function getScaledCoordinateX(map: Map, imageSize: number, xFromDemo: number) {
  const xForDefaultRadarWidth = (xFromDemo - map.posX) / map.scale;
  const scaledX = (xForDefaultRadarWidth * imageSize) / MAP_RADAR_SIZE;
  return scaledX;
}
