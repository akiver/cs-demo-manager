import type { Game } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';
import type { Generated, Insertable, Selectable, Updateable } from 'kysely';

export type MapTable = {
  id: Generated<ColumnID>;
  name: string;
  game: Game;
  position_x: number;
  position_y: number;
  threshold_z: number;
  scale: number;
};

export type MapRow = Selectable<MapTable>;
export type InsertableMap = Insertable<MapTable>;
export type UpdatableMap = Updateable<MapTable>;
