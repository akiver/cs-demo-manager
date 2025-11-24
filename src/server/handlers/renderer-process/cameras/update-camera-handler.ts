import { handleError } from '../../handle-error';
import type { UpdateCameraPayload } from './camera-payload';
import { updateCamera } from 'csdm/node/database/cameras/update-camera';
import { cameraRowToCamera } from 'csdm/node/database/cameras/camera-row-to-camera';
import { writeCameraPreviewImage } from 'csdm/node/filesystem/cameras/write-camera-preview-image';
import { getCameraPreviewBase64 } from 'csdm/node/filesystem/cameras/get-camera-preview-base64';
import { ensureCamerasPreviewsFolderExist } from 'csdm/node/filesystem/cameras/ensure-cameras-previews-folders-exist';
import { getImageFormatFromBase64 } from 'csdm/node/filesystem/image';

export async function updateCameraHandler(payload: UpdateCameraPayload) {
  const { id, previewBase64 } = payload;
  try {
    await ensureCamerasPreviewsFolderExist();

    const updatedCamera = await updateCamera({
      id,
      game: payload.game,
      name: payload.name,
      map_name: payload.mapName,
      x: payload.x,
      y: payload.y,
      z: payload.z,
      yaw: payload.yaw,
      pitch: payload.pitch,
      comment: payload.comment,
      color: payload.color,
    });

    const currentPreviewBase64 = await getCameraPreviewBase64(id);
    const format = getImageFormatFromBase64(previewBase64);
    if (format && previewBase64 !== currentPreviewBase64) {
      await writeCameraPreviewImage(id, previewBase64, format);
    }

    const camera = await cameraRowToCamera(updatedCamera);

    return camera;
  } catch (error) {
    handleError(error, 'Error while updating camera');
  }
}
