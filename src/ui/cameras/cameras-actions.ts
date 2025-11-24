import { createAction } from '@reduxjs/toolkit';
import type { Camera } from 'csdm/common/types/camera';

export const addCameraSuccess = createAction<{ camera: Camera }>('cameras/addSuccess');
export const deleteCameraSuccess = createAction<{ cameraId: string }>('cameras/deleteSuccess');
export const updateCameraSuccess = createAction<{ camera: Camera }>('cameras/updateSuccess');
