import { useContext } from 'react';
import { CameraFormContext } from './camera-form-provider';

export function useCameraForm() {
  const form = useContext(CameraFormContext);

  return form;
}
