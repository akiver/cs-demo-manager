import type { Game } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';
import type { Generated, Insertable, Selectable } from 'kysely';

export type CamerasTable = {
  id: Generated<ColumnID>;
  name: string;
  game: Game;
  map_name: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  color: string;
  comment: string;
};

export type CameraRow = Selectable<CamerasTable>;
export type InsertableCamera = Insertable<CamerasTable>;
export type UpdatableCamera = InsertableCamera & { id: ColumnID };
