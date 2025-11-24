import type { Game } from 'csdm/common/types/counter-strike';

export type CameraPayload = {
  id?: string;
  name: string;
  game: Game;
  mapName: string;
  x: number;
  y: number;
  z: number;
  pitch: number;
  yaw: number;
  comment: string;
  color: string;
  // Use base64 data instead of images file path so we don't have to deal with possible inexistent files
  previewBase64: string;
};

export type UpdateCameraPayload = Omit<CameraPayload, 'id'> & {
  id: string;
};
