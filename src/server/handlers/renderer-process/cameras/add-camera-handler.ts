import { handleError } from '../../handle-error';
import type { CameraPayload } from './camera-payload';
import type { InsertableCamera } from 'csdm/node/database/cameras/cameras-table';
import { insertCamera } from 'csdm/node/database/cameras/insert-cameras';
import { writeCameraPreviewImage } from 'csdm/node/filesystem/cameras/write-camera-preview-image';
import { ensureCamerasPreviewsFolderExist } from 'csdm/node/filesystem/cameras/ensure-cameras-previews-folders-exist';
import { getImageFormatFromBase64 } from 'csdm/node/filesystem/image';
import { cameraRowToCamera } from 'csdm/node/database/cameras/camera-row-to-camera';

export async function addCameraHandler({ previewBase64, mapName, ...payload }: CameraPayload) {
  try {
    await ensureCamerasPreviewsFolderExist();
    const cameraToInsert: InsertableCamera = {
      ...payload,
      map_name: mapName,
    };
    const camera = await insertCamera(cameraToInsert);
    const imageFormat = getImageFormatFromBase64(previewBase64);
    if (imageFormat) {
      await writeCameraPreviewImage(String(camera.id), previewBase64, imageFormat);
    }
    const newCamera = cameraRowToCamera(camera);

    return newCamera;
  } catch (error) {
    handleError(error, 'Error while adding camera');
  }
}
