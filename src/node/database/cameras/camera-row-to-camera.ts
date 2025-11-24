import type { CameraRow } from './cameras-table';
import type { Camera } from 'csdm/common/types/camera';
import { getCameraPreviewImagePath } from 'csdm/node/filesystem/cameras/get-camera-preview-image-path';

export async function cameraRowToCamera(row: CameraRow): Promise<Camera> {
  return {
    id: String(row.id),
    name: row.name,
    mapName: row.map_name,
    game: row.game,
    x: row.x,
    y: row.y,
    z: row.z,
    yaw: row.yaw,
    pitch: row.pitch,
    comment: row.comment,
    color: row.color,
    imagePath: await getCameraPreviewImagePath(row.id),
  };
}
