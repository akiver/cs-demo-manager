import type { Generated, Selectable } from 'kysely';
import type { ColumnID } from 'csdm/common/types/column-id';

export type BombDefuseStartTable = {
  id: Generated<ColumnID>;
  match_checksum: string;
  round_number: number;
  tick: number;
  frame: number;
  defuser_steam_id: string;
  defuser_name: string;
  is_defuser_controlling_bot: boolean;
  x: number;
  y: number;
  z: number;
};

export type BombDefuseStartRow = Selectable<BombDefuseStartTable>;
