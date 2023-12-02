import type { Generated, Selectable } from 'kysely';
import type { ColumnID } from 'csdm/common/types/column-id';

export type InfernoPositionTable = {
  id: Generated<ColumnID>;
  match_checksum: string;
  round_number: number;
  tick: number;
  frame: number;
  thrower_steam_id: string;
  thrower_name: string;
  unique_id: string;
  x: number;
  y: number;
  z: number;
  convex_hull_2d: string;
};

export type InfernoPositionRow = Selectable<InfernoPositionTable>;
