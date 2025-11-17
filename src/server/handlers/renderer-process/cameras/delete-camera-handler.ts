import { handleError } from '../../handle-error';
import { deleteCamera } from 'csdm/node/database/cameras/delete-camera';

export async function deleteCameraHandler(cameraId: string) {
  try {
    await deleteCamera(cameraId);
  } catch (error) {
    handleError(error, 'Error while deleting camera');
  }
}
