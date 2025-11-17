import type { Game } from 'csdm/common/types/counter-strike';

export type CameraCoordinates = {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
};

export type Camera = CameraCoordinates & {
  id: string;
  name: string;
  game: Game;
  mapName: string;
  comment: string;
  color: string;
  imagePath: string | null;
};
