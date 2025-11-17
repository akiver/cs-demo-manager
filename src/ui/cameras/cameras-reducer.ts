import { createReducer } from '@reduxjs/toolkit';
import { initializeAppSuccess } from 'csdm/ui/bootstrap/bootstrap-actions';
import type { Camera } from 'csdm/common/types/camera';
import { addCameraSuccess, deleteCameraSuccess, updateCameraSuccess } from './cameras-actions';

function sortCamerasByName(camera1: Camera, camera2: Camera) {
  return camera1.name.localeCompare(camera2.name);
}

type CamerasState = {
  readonly entities: Camera[];
  // Used to read images on the FS only if cameras have changed (reduce file:// requests).
  readonly cacheTimestamp: number;
};

const initialState: CamerasState = {
  entities: [],
  cacheTimestamp: Date.now(),
};

export const camerasReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(addCameraSuccess, (state, action) => {
      state.entities.push(action.payload.camera);
      state.entities.sort(sortCamerasByName);
    })
    .addCase(deleteCameraSuccess, (state, action) => {
      state.entities = state.entities.filter((camera) => {
        return !action.payload.cameraId.includes(camera.id);
      });
    })
    .addCase(updateCameraSuccess, (state, action) => {
      const cameraIndex = state.entities.findIndex((camera) => camera.id === action.payload.camera.id);
      if (cameraIndex > -1) {
        state.entities[cameraIndex] = action.payload.camera;
        state.cacheTimestamp = Date.now();
      }
    })
    .addCase(initializeAppSuccess, (state, action) => {
      state.entities = action.payload.cameras.sort(sortCamerasByName);
    });
});
