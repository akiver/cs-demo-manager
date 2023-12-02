import { MAP_RADAR_SIZE } from 'csdm/ui/maps/maps-constants';
import type { Map } from 'csdm/common/types/map';

export function getScaledCoordinateY(map: Map, imageSize: number, yFromDemo: number) {
  const yForDefaultRadarHeight = (map.posY - yFromDemo) / map.scale;
  const scaledY = (yForDefaultRadarHeight * imageSize) / MAP_RADAR_SIZE;
  return scaledY;
}
